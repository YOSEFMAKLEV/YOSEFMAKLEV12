"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ProjectType, ProjectStatus, DealerBillingModel } from "@/generated/prisma/client";

const DEFAULT_CHECKLIST_ITEMS = [
  { label: 'אישור רבנות ליצור', order: 1, category: 'חלב' },
  { label: 'הסתיים ביקור', order: 2, category: null },
  { label: 'דווח בי"ד', order: 3, category: null },
  { label: 'הושלם דווח רבנות', order: 4, category: null },
  { label: 'התקבלה תעודה מבי"ד', order: 5, category: null },
  { label: 'הוגש רבנות', order: 6, category: null },
  { label: 'התקבלה מהרבנות', order: 7, category: null },
  { label: 'תעודה הונפקה', order: 8, category: null },
  { label: 'חשבונית נשלחה', order: 9, category: null },
];

export async function getProjects(organizationId: string, search?: string) {
  const now = new Date();
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
      site: { select: { id: true, name: true, country: true, timezone: true } },
      certBody: { select: { id: true, name: true } },
      dealer: { select: { id: true, name: true } },
      assignments: {
        where: { scheduledAt: { gte: now } },
        orderBy: { scheduledAt: "asc" },
        select: {
          id: true,
          scheduledAt: true,
          scheduledEnd: true,
          mashgiach: { select: { id: true, name: true } },
        },
      },
      _count: { select: { assignments: true, certificates: true } },
    },
    orderBy: { openedAt: "desc" },
  });
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      client: {
        include: {
          priceItems: { where: { isActive: true }, orderBy: { order: "asc" } },
        },
      },
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
      lineItems: {
        orderBy: { order: "asc" },
        include: { priceItem: { select: { id: true, name: true, unitLabel: true } } },
      },
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
  plannedVisitEnd?: Date;
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

export async function updateProject(
  id: string,
  data: {
    plannedVisitAt?: Date | null;
    plannedVisitEnd?: Date | null;
    notes?: string;
  }
) {
  const project = await prisma.project.update({ where: { id }, data });
  revalidatePath(`/projects/${id}`);
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

// ─── Checklist ────────────────────────────────────────────────────────────────

async function ensureChecklistTemplates(organizationId: string) {
  const existing = await prisma.projectChecklistTemplate.count({
    where: { organizationId },
  });
  if (existing === 0) {
    await prisma.projectChecklistTemplate.createMany({
      data: DEFAULT_CHECKLIST_ITEMS.map((item) => ({
        organizationId,
        ...item,
      })),
    });
  }
}

export async function getProjectChecklist(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { organizationId: true },
  });
  if (!project) throw new Error("Project not found");

  await ensureChecklistTemplates(project.organizationId);

  const templates = await prisma.projectChecklistTemplate.findMany({
    where: { organizationId: project.organizationId, isActive: true },
    orderBy: { order: "asc" },
  });

  const existingItems = await prisma.projectChecklistItem.findMany({
    where: { projectId },
    select: { templateId: true },
  });
  const existingIds = new Set(existingItems.map((i) => i.templateId));
  const missing = templates.filter((t) => !existingIds.has(t.id));

  if (missing.length > 0) {
    await prisma.projectChecklistItem.createMany({
      data: missing.map((t) => ({ projectId, templateId: t.id })),
    });
  }

  return prisma.projectChecklistItem.findMany({
    where: { projectId },
    include: { template: true },
    orderBy: { template: { order: "asc" } },
  });
}

export async function toggleChecklistItem(
  itemId: string,
  isCompleted: boolean,
  completedBy?: string
) {
  const item = await prisma.projectChecklistItem.update({
    where: { id: itemId },
    data: {
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
      completedBy: isCompleted ? (completedBy ?? null) : null,
    },
  });
  revalidatePath("/projects");
  return item;
}

export async function getChecklistTemplates(organizationId: string) {
  await ensureChecklistTemplates(organizationId);
  return prisma.projectChecklistTemplate.findMany({
    where: { organizationId },
    orderBy: { order: "asc" },
  });
}

export async function upsertChecklistTemplate(data: {
  id?: string;
  organizationId: string;
  label: string;
  order: number;
  category?: string;
  isActive?: boolean;
}) {
  if (data.id) {
    return prisma.projectChecklistTemplate.update({
      where: { id: data.id },
      data: { label: data.label, order: data.order, category: data.category, isActive: data.isActive },
    });
  }
  return prisma.projectChecklistTemplate.create({ data });
}
