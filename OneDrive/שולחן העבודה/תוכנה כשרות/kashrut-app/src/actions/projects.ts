"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ProjectType, ProjectStatus, DealerBillingModel } from "@/generated/prisma/client";

export async function getProjects(organizationId: string, search?: string) {
  return prisma.project.findMany({
    where: {
      organizationId,
      ...(search ? {
        OR: [
          { client: { name: { contains: search, mode: "insensitive" } } },
          { site: { name: { contains: search, mode: "insensitive" } } },
        ],
      } : {}),
    },
    include: {
      client: { select: { id: true, name: true } },
      site: { select: { id: true, name: true, country: true } },
      certBody: { select: { id: true, name: true } },
      dealer: { select: { id: true, name: true } },
      _count: { select: { assignments: true, certificates: true } },
    },
    orderBy: { openedAt: "desc" },
  });
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      site: true,
      certBody: true,
      dealer: true,
      products: { include: { product: true } },
      assignments: {
        orderBy: { scheduledAt: "desc" },
        include: { mashgiach: { select: { id: true, name: true } } },
      },
      certificates: { orderBy: { issuedAt: "desc" } },
      invoices: { orderBy: { createdAt: "desc" } },
      activityLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { name: true } } },
      },
    },
  });
}

export async function createProject(data: {
  organizationId: string;
  clientId: string;
  siteId: string;
  type: ProjectType;
  certBodyId?: string;
  dealerId?: string;
  dealerBillingModel?: DealerBillingModel;
  plannedVisitAt?: Date;
  notes?: string;
  createdByUserId?: string;
}) {
  const { createdByUserId, ...rest } = data;
  const project = await prisma.project.create({ data: rest });

  await prisma.activityLog.create({
    data: {
      organizationId: data.organizationId,
      entityType: "project",
      entityId: project.id,
      action: "created",
      description: `פרויקט נוצר`,
      userId: createdByUserId,
      clientId: data.clientId,
    },
  });

  revalidatePath("/projects");
  return project;
}

export async function updateProjectStatus(
  id: string,
  status: ProjectStatus,
  userId?: string
) {
  const project = await prisma.project.update({
    where: { id },
    data: { status },
  });

  await prisma.activityLog.create({
    data: {
      organizationId: project.organizationId,
      entityType: "project",
      entityId: id,
      action: "status_changed",
      description: `סטטוס פרויקט שונה ל-${status}`,
      userId,
      clientId: project.clientId,
    },
  });

  revalidatePath(`/projects/${id}`);
  return project;
}
