"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getHologramBatches(organizationId: string) {
  return prisma.hologramBatch.findMany({
    where: { organizationId },
    include: {
      certBody: { select: { id: true, name: true } },
      allocations: {
        include: {
          usages: true,
          project: {
            select: {
              id: true,
              client: { select: { id: true, name: true } },
              site: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
    orderBy: { receivedAt: "desc" },
  });
}

export async function createHologramBatch(data: {
  organizationId: string;
  certBodyId?: string;
  rangeFrom: number;
  rangeTo: number;
  notes?: string;
}) {
  const batch = await prisma.hologramBatch.create({ data });
  revalidatePath("/holograms");
  return batch;
}

export async function allocateHolograms(data: {
  batchId: string;
  projectId: string;
  rangeFrom: number;
  rangeTo: number;
}) {
  const alloc = await prisma.hologramAllocation.create({ data });
  revalidatePath("/holograms");
  return alloc;
}

export async function recordHologramUsage(data: {
  allocationId: string;
  rangeFrom: number;
  rangeTo: number;
  reportId?: string;
}) {
  const usage = await prisma.hologramUsage.create({ data });
  revalidatePath("/holograms");
  return usage;
}

export async function getHologramInventorySummary(organizationId: string) {
  const batches = await prisma.hologramBatch.findMany({
    where: { organizationId },
    include: { allocations: { include: { usages: true } } },
  });

  let totalIssued = 0;
  let totalAllocated = 0;
  let totalUsed = 0;

  for (const batch of batches) {
    const batchTotal = batch.rangeTo - batch.rangeFrom + 1;
    totalIssued += batchTotal;
    for (const alloc of batch.allocations) {
      const allocTotal = alloc.rangeTo - alloc.rangeFrom + 1;
      totalAllocated += allocTotal;
      for (const usage of alloc.usages) {
        totalUsed += usage.rangeTo - usage.rangeFrom + 1;
      }
    }
  }

  return {
    totalIssued,
    totalAllocated,
    totalUsed,
    available: totalIssued - totalAllocated,
    allocated: totalAllocated - totalUsed,
  };
}

// ─── Transfers ────────────────────────────────────────────────────────────────

export async function createTransfer(data: {
  organizationId: string;
  batchId: string;
  rangeFrom: number;
  rangeTo: number;
  fromType: "ORG" | "MASHGIACH";
  fromMashgiachId?: string;
  toType: "ORG" | "MASHGIACH";
  toMashgiachId?: string;
  notes?: string;
}) {
  const transfer = await prisma.hologramTransfer.create({ data });
  revalidatePath("/holograms");
  revalidatePath("/mashgiach/holograms");
  return transfer;
}

export async function confirmTransfer(transferId: string) {
  const transfer = await prisma.hologramTransfer.update({
    where: { id: transferId },
    data: { status: "CONFIRMED", confirmedAt: new Date() },
  });
  revalidatePath("/holograms");
  revalidatePath("/mashgiach/holograms");
  return transfer;
}

export async function rejectTransfer(transferId: string) {
  const transfer = await prisma.hologramTransfer.update({
    where: { id: transferId },
    data: { status: "REJECTED", rejectedAt: new Date() },
  });
  revalidatePath("/holograms");
  revalidatePath("/mashgiach/holograms");
  return transfer;
}

export async function cancelTransfer(transferId: string) {
  const transfer = await prisma.hologramTransfer.update({
    where: { id: transferId },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/holograms");
  revalidatePath("/mashgiach/holograms");
  return transfer;
}

const batchWithCertBody = {
  select: {
    id: true,
    rangeFrom: true,
    rangeTo: true,
    notes: true,
    certBody: { select: { id: true, name: true } },
  },
} as const;

export async function getTransfers(organizationId: string) {
  return prisma.hologramTransfer.findMany({
    where: { organizationId },
    include: {
      batch: batchWithCertBody,
      fromMashgiach: { select: { id: true, name: true } },
      toMashgiach: { select: { id: true, name: true } },
    },
    orderBy: { sentAt: "desc" },
  });
}

export async function getMashgiachTransfers(mashgiachId: string) {
  return prisma.hologramTransfer.findMany({
    where: {
      OR: [{ fromMashgiachId: mashgiachId }, { toMashgiachId: mashgiachId }],
    },
    include: {
      batch: batchWithCertBody,
      fromMashgiach: { select: { id: true, name: true } },
      toMashgiach: { select: { id: true, name: true } },
    },
    orderBy: { sentAt: "desc" },
  });
}

// Returns total balance + breakdown by certifying body
export async function getMashgiachHologramBalance(mashgiachId: string) {
  const transfers = await prisma.hologramTransfer.findMany({
    where: {
      status: "CONFIRMED",
      OR: [{ fromMashgiachId: mashgiachId }, { toMashgiachId: mashgiachId }],
    },
    include: { batch: { select: { certBody: { select: { id: true, name: true } } } } },
  });

  let total = 0;
  const byCertBody: Record<string, { name: string; balance: number }> = {};

  for (const t of transfers) {
    const qty = t.rangeTo - t.rangeFrom + 1;
    const cb = t.batch.certBody;
    const cbKey = cb?.id ?? "unknown";
    const cbName = cb?.name ?? "לא ידוע";

    if (!byCertBody[cbKey]) byCertBody[cbKey] = { name: cbName, balance: 0 };

    if (t.toMashgiachId === mashgiachId) {
      total += qty;
      byCertBody[cbKey].balance += qty;
    }
    if (t.fromMashgiachId === mashgiachId) {
      total -= qty;
      byCertBody[cbKey].balance -= qty;
    }
  }

  return { total, byCertBody };
}

export async function getAllMashgiachimBalances(organizationId: string) {
  const transfers = await prisma.hologramTransfer.findMany({
    where: { organizationId, status: "CONFIRMED" },
    include: {
      batch: { select: { certBody: { select: { id: true, name: true } } } },
      fromMashgiach: { select: { id: true, name: true } },
      toMashgiach: { select: { id: true, name: true } },
    },
  });

  const balances: Record<string, {
    name: string;
    total: number;
    byCertBody: Record<string, { name: string; balance: number }>;
  }> = {};

  for (const t of transfers) {
    const qty = t.rangeTo - t.rangeFrom + 1;
    const cb = t.batch.certBody;
    const cbKey = cb?.id ?? "unknown";
    const cbName = cb?.name ?? "לא ידוע";

    const addTo = (mashgiach: { id: string; name: string }, delta: number) => {
      if (!balances[mashgiach.id]) balances[mashgiach.id] = { name: mashgiach.name, total: 0, byCertBody: {} };
      balances[mashgiach.id].total += delta;
      if (!balances[mashgiach.id].byCertBody[cbKey]) balances[mashgiach.id].byCertBody[cbKey] = { name: cbName, balance: 0 };
      balances[mashgiach.id].byCertBody[cbKey].balance += delta;
    };

    if (t.toType === "MASHGIACH" && t.toMashgiach) addTo(t.toMashgiach, qty);
    if (t.fromType === "MASHGIACH" && t.fromMashgiach) addTo(t.fromMashgiach, -qty);
  }

  return balances;
}
