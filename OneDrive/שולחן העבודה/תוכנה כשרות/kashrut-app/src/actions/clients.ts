"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ClientType, CertRelease } from "@/generated/prisma/client";

export async function getClients(organizationId: string, search?: string) {
  return prisma.client.findMany({
    where: {
      organizationId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { nameEn: { contains: search, mode: "insensitive" } },
              { contactName: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { sites: true, projects: true } },
      defaultDealer: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getClientById(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      defaultDealer: { select: { id: true, name: true } },
      priceItems: { where: { isActive: true }, orderBy: { order: "asc" } },
      sites: { include: { _count: { select: { projects: true } } } },
      projects: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { site: true, certBody: true, dealer: { select: { id: true, name: true } } },
      },
      certificates: { orderBy: { issuedAt: "desc" }, take: 10 },
      invoices: { orderBy: { createdAt: "desc" }, take: 10 },
      activityLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { name: true } } },
      },
    },
  });
}

export async function createClient(data: {
  organizationId: string;
  name: string;
  nameEn?: string;
  type: ClientType;
  vatNumber?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  certRelease?: CertRelease;
  requiresQuote?: boolean;
  createdByUserId?: string;
}) {
  const client = await prisma.client.create({ data });

  await prisma.activityLog.create({
    data: {
      organizationId: data.organizationId,
      entityType: "client",
      entityId: client.id,
      action: "created",
      description: `לקוח נוצר: ${client.name}`,
      userId: data.createdByUserId,
      clientId: client.id,
    },
  });

  revalidatePath("/clients");
  return client;
}

export async function updateClient(
  id: string,
  data: Partial<{
    name: string;
    nameEn: string;
    type: ClientType;
    vatNumber: string;
    contactName: string;
    phone: string;
    email: string;
    address: string;
    certRelease: CertRelease;
    requiresQuote: boolean;
  }>,
  userId?: string
) {
  const client = await prisma.client.update({ where: { id }, data });

  await prisma.activityLog.create({
    data: {
      organizationId: client.organizationId,
      entityType: "client",
      entityId: id,
      action: "updated",
      description: `פרטי לקוח עודכנו`,
      userId,
      clientId: id,
    },
  });

  revalidatePath(`/clients/${id}`);
  return client;
}

export async function deleteClient(id: string, userId?: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    select: { name: true, organizationId: true },
  });
  if (!client) throw new Error("Client not found");

  await prisma.activityLog.create({
    data: {
      organizationId: client.organizationId,
      entityType: "client",
      entityId: id,
      action: "deleted",
      description: `לקוח נמחק: ${client.name}`,
      userId,
    },
  });

  await prisma.client.delete({ where: { id } });
  revalidatePath("/clients");
}

export async function addActivityNote(
  clientId: string,
  organizationId: string,
  note: string,
  userId?: string
) {
  await prisma.activityLog.create({
    data: {
      organizationId,
      entityType: "client",
      entityId: clientId,
      action: "note",
      description: note,
      userId,
      clientId,
    },
  });
  revalidatePath(`/clients/${clientId}`);
}
