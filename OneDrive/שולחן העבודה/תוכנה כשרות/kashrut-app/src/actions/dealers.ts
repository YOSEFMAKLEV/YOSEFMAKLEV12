"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getDealers(organizationId: string) {
  return prisma.dealer.findMany({
    where: { organizationId },
    include: {
      _count: { select: { projects: true, defaultForClients: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function createDealer(data: {
  organizationId: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  notes?: string;
}) {
  const dealer = await prisma.dealer.create({ data });
  revalidatePath("/dealers");
  return dealer;
}

export async function updateDealer(
  id: string,
  data: Partial<{ name: string; contactName: string; phone: string; email: string; notes: string; isActive: boolean }>
) {
  const dealer = await prisma.dealer.update({ where: { id }, data });
  revalidatePath("/dealers");
  return dealer;
}

export async function deleteDealer(id: string) {
  await prisma.dealer.delete({ where: { id } });
  revalidatePath("/dealers");
}

export async function setClientDefaultDealer(clientId: string, dealerId: string | null) {
  await prisma.client.update({
    where: { id: clientId },
    data: { defaultDealerId: dealerId },
  });
  revalidatePath(`/clients/${clientId}`);
}
