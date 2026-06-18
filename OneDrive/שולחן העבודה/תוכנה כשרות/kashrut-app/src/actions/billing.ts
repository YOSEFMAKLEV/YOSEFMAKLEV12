"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { BillingSource, CommissionType, Currency } from "@/generated/prisma/client";

// ─── Client billing settings ─────────────────────────────────────────────────

export async function updateClientBilling(clientId: string, data: {
  billingSource?: BillingSource;
  agentCommissionDealerId?: string | null;
  agentCommissionType?: CommissionType;
  agentCommissionValue?: number | null;
  annualFee?: number | null;
  annualFeeCurrency?: Currency;
  billingNotes?: string | null;
}) {
  await prisma.client.update({ where: { id: clientId }, data });
  revalidatePath(`/clients/${clientId}`);
}

// ─── Price items ──────────────────────────────────────────────────────────────

export async function getClientPriceItems(clientId: string) {
  return prisma.clientPriceItem.findMany({
    where: { clientId, isActive: true },
    orderBy: { order: "asc" },
  });
}

export async function upsertClientPriceItem(data: {
  id?: string;
  clientId: string;
  name: string;
  unitLabel?: string;
  price: number;
  currency: Currency;
  order?: number;
}) {
  if (data.id) {
    const item = await prisma.clientPriceItem.update({
      where: { id: data.id },
      data: { name: data.name, unitLabel: data.unitLabel, price: data.price, currency: data.currency, order: data.order ?? 0 },
    });
    revalidatePath(`/clients/${data.clientId}`);
    return item;
  }
  const count = await prisma.clientPriceItem.count({ where: { clientId: data.clientId } });
  const item = await prisma.clientPriceItem.create({
    data: { clientId: data.clientId, name: data.name, unitLabel: data.unitLabel, price: data.price, currency: data.currency, order: data.order ?? count },
  });
  revalidatePath(`/clients/${data.clientId}`);
  return item;
}

export async function deleteClientPriceItem(id: string, clientId: string) {
  await prisma.clientPriceItem.delete({ where: { id } });
  revalidatePath(`/clients/${clientId}`);
}

// ─── Project line items ───────────────────────────────────────────────────────

export async function getProjectLineItems(projectId: string) {
  return prisma.projectLineItem.findMany({
    where: { projectId },
    include: { priceItem: { select: { id: true, name: true, currency: true } } },
    orderBy: { order: "asc" },
  });
}

export async function upsertProjectLineItem(data: {
  id?: string;
  projectId: string;
  priceItemId?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  currency: Currency;
  notes?: string;
  order?: number;
}) {
  if (data.id) {
    const item = await prisma.projectLineItem.update({
      where: { id: data.id },
      data: { priceItemId: data.priceItemId, description: data.description, quantity: data.quantity, unitPrice: data.unitPrice, currency: data.currency, notes: data.notes, order: data.order ?? 0 },
    });
    revalidatePath(`/projects/${data.projectId}`);
    return item;
  }
  const count = await prisma.projectLineItem.count({ where: { projectId: data.projectId } });
  const item = await prisma.projectLineItem.create({
    data: { projectId: data.projectId, priceItemId: data.priceItemId, description: data.description, quantity: data.quantity, unitPrice: data.unitPrice, currency: data.currency, notes: data.notes, order: data.order ?? count },
  });
  revalidatePath(`/projects/${data.projectId}`);
  return item;
}

export async function deleteProjectLineItem(id: string, projectId: string) {
  await prisma.projectLineItem.delete({ where: { id } });
  revalidatePath(`/projects/${projectId}`);
}
