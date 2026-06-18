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
      contacts: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
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
  language?: string;
  internalReport?: boolean;
  rabbinateReport?: boolean;
  createdByUserId?: string;
  contacts?: { name: string; role?: string; phone?: string; email?: string }[];
}) {
  const { contacts, createdByUserId, ...siteData } = data;
  const site = await prisma.site.create({ data: siteData });

  if (contacts && contacts.length > 0) {
    const filtered = contacts.filter(c => c.name.trim());
    if (filtered.length > 0) {
      await prisma.siteContact.createMany({
        data: filtered.map((c, i) => ({ ...c, siteId: site.id, isPrimary: i === 0 })),
      });
    }
  }

  await prisma.activityLog.create({
    data: {
      organizationId: data.organizationId,
      entityType: "site",
      entityId: site.id,
      action: "created",
      description: `מפעל/עסק נוצר: ${site.name}`,
      userId: createdByUserId,
      siteId: site.id,
    },
  });

  revalidatePath("/sites");
  return site;
}

export async function upsertSiteContact(
  siteId: string,
  contactId: string | null,
  data: { name: string; role?: string; phone?: string; email?: string; isPrimary?: boolean }
) {
  if (contactId) {
    const c = await prisma.siteContact.update({ where: { id: contactId }, data });
    revalidatePath(`/sites/${siteId}`);
    return c;
  }
  const c = await prisma.siteContact.create({ data: { ...data, siteId } });
  revalidatePath(`/sites/${siteId}`);
  return c;
}

export async function deleteSiteContact(siteId: string, contactId: string) {
  await prisma.siteContact.delete({ where: { id: contactId } });
  revalidatePath(`/sites/${siteId}`);
}

export async function setSiteContactPrimary(siteId: string, contactId: string) {
  await prisma.siteContact.updateMany({ where: { siteId }, data: { isPrimary: false } });
  await prisma.siteContact.update({ where: { id: contactId }, data: { isPrimary: true } });
  revalidatePath(`/sites/${siteId}`);
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

export async function deleteSite(id: string, userId?: string) {
  const site = await prisma.site.findUnique({
    where: { id },
    select: { name: true, organizationId: true },
  });
  if (!site) throw new Error("Site not found");

  await prisma.activityLog.create({
    data: {
      organizationId: site.organizationId,
      entityType: "site",
      entityId: id,
      action: "deleted",
      description: `מפעל/עסק נמחק: ${site.name}`,
      userId,
      siteId: id,
    },
  });

  await prisma.site.delete({ where: { id } });
  revalidatePath("/sites");
}
