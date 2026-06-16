"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { SiteType } from "@/generated/prisma/client";

export async function getSites(organizationId: string, search?: string) {
  return prisma.site.findMany({
    where: {
      organizationId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { nameEn: { contains: search, mode: "insensitive" } },
              { country: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      client: { select: { id: true, name: true } },
      _count: { select: { projects: true, products: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getSiteById(id: string) {
  return prisma.site.findUnique({
    where: { id },
    include: {
      client: true,
      products: { orderBy: { name: "asc" } },
      productionPoints: { include: { mashgichim: { include: { mashgiach: true } } } },
      projects: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { client: true, certBody: true },
      },
      activityLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { name: true } } },
      },
    },
  });
}

export async function createSite(data: {
  organizationId: string;
  clientId: string;
  name: string;
  nameEn?: string;
  type: SiteType;
  address?: string;
  country: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
  contactName?: string;
  phone?: string;
  email?: string;
  language?: string;
  internalReport?: boolean;
  rabbinateReport?: boolean;
  createdByUserId?: string;
}) {
  const site = await prisma.site.create({ data });

  await prisma.activityLog.create({
    data: {
      organizationId: data.organizationId,
      entityType: "site",
      entityId: site.id,
      action: "created",
      description: `מפעל/עסק נוצר: ${site.name}`,
      userId: data.createdByUserId,
      siteId: site.id,
    },
  });

  revalidatePath("/sites");
  return site;
}

export async function updateSite(
  id: string,
  data: Partial<{
    name: string;
    nameEn: string;
    type: SiteType;
    address: string;
    country: string;
    timezone: string;
    latitude: number;
    longitude: number;
    contactName: string;
    phone: string;
    email: string;
    language: string;
    internalReport: boolean;
    rabbinateReport: boolean;
    rabbinateTemplate: string;
  }>,
  userId?: string
) {
  const site = await prisma.site.update({ where: { id }, data });

  await prisma.activityLog.create({
    data: {
      organizationId: site.organizationId,
      entityType: "site",
      entityId: id,
      action: "updated",
      description: "פרטי מפעל/עסק עודכנו",
      userId,
      siteId: id,
    },
  });

  revalidatePath(`/sites/${id}`);
  return site;
}
