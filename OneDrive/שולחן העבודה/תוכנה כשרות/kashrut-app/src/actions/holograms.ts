"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getHologramBatches(organizationId: string) {
  return prisma.hologramBatch.findMany({
    where: { organizationId },
    include: {
      allocations: {
        include: { usages: true },
      },
    },
    orderBy: { receivedAt: "desc" },
  });
}

export async function createHologramBatch(data: {
  organizationId: string;
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
