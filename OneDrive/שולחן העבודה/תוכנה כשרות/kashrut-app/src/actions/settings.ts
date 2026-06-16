"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCertBodies(organizationId: string) {
  return prisma.certBody.findMany({
    where: { organizationId, isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function createCertBody(data: {
  organizationId: string;
  name: string;
  nameEn?: string;
  country?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  notes?: string;
}) {
  const body = await prisma.certBody.create({ data });
  revalidatePath("/settings");
  return body;
}

export async function updateCertBody(
  id: string,
  data: Partial<{ name: string; nameEn: string; country: string; contactName: string; phone: string; email: string; notes: string; isActive: boolean }>
) {
  const body = await prisma.certBody.update({ where: { id }, data });
  revalidatePath("/settings");
  return body;
}

export async function getSupervisionLevels(organizationId: string) {
  return prisma.supervisionLevel.findMany({
    where: { organizationId, isActive: true },
    orderBy: { name: "asc" },
  });
}

export async function createSupervisionLevel(data: {
  organizationId: string;
  name: string;
  nameEn?: string;
  color?: string;
}) {
  const level = await prisma.supervisionLevel.create({ data });
  revalidatePath("/settings");
  return level;
}

export async function updateSupervisionLevel(
  id: string,
  data: Partial<{ name: string; nameEn: string; color: string; isActive: boolean }>
) {
  const level = await prisma.supervisionLevel.update({ where: { id }, data });
  revalidatePath("/settings");
  return level;
}
