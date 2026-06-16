"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SalaryModel, ExpensesType } from "@/generated/prisma/client";

export async function getMashgichim(organizationId: string, search?: string) {
  return prisma.mashgiach.findMany({
    where: {
      organizationId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { assignments: true } },
      levels: { include: { level: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getMashgiachById(id: string) {
  return prisma.mashgiach.findUnique({
    where: { id },
    include: {
      levels: { include: { level: true } },
      certBodies: { include: { certBody: true } },
      assignments: {
        orderBy: { scheduledAt: "desc" },
        take: 20,
        include: {
          site: { select: { id: true, name: true, country: true } },
          project: { select: { id: true, type: true, status: true } },
        },
      },
    },
  });
}

export async function createMashgiach(data: {
  organizationId: string;
  name: string;
  nameEn?: string;
  phone?: string;
  email?: string;
  city?: string;
  citizenships?: string[];
  activeRegions?: string[];
  languages?: Record<string, string>;
  salaryModel?: SalaryModel;
  salaryRate?: number;
  expensesType?: ExpensesType;
  fixedExpenses?: number;
  notes?: string;
  createdByUserId?: string;
}) {
  const { createdByUserId, ...rest } = data;
  const mashgiach = await prisma.mashgiach.create({ data: rest });

  await prisma.activityLog.create({
    data: {
      organizationId: data.organizationId,
      entityType: "mashgiach",
      entityId: mashgiach.id,
      action: "created",
      description: `משגיח נוצר: ${mashgiach.name}`,
      userId: createdByUserId,
    },
  });

  revalidatePath("/mashgichim");
  return mashgiach;
}

export async function updateMashgiach(
  id: string,
  data: Partial<{
    name: string;
    nameEn: string;
    phone: string;
    email: string;
    city: string;
    citizenships: string[];
    activeRegions: string[];
    languages: Record<string, string>;
    salaryModel: SalaryModel;
    salaryRate: number;
    expensesType: ExpensesType;
    fixedExpenses: number;
    notes: string;
    isActive: boolean;
  }>,
  userId?: string
) {
  const mashgiach = await prisma.mashgiach.update({ where: { id }, data });

  await prisma.activityLog.create({
    data: {
      organizationId: mashgiach.organizationId,
      entityType: "mashgiach",
      entityId: id,
      action: "updated",
      description: "פרטי משגיח עודכנו",
      userId,
    },
  });

  revalidatePath(`/mashgichim/${id}`);
  return mashgiach;
}
