"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { VisitType } from "@/generated/prisma/client";

export async function getAssignments(organizationId: string, from?: Date, to?: Date) {
  return prisma.assignment.findMany({
    where: {
      organizationId,
      ...(from && to ? { scheduledAt: { gte: from, lte: to } } : {}),
    },
    include: {
      mashgiach: { select: { id: true, name: true } },
      site: { select: { id: true, name: true, country: true, timezone: true } },
      project: { select: { id: true, type: true, status: true, clientId: true, client: { select: { name: true } } } },
    },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function createAssignment(data: {
  organizationId: string;
  projectId: string;
  siteId: string;
  mashgiachId: string;
  type: VisitType;
  scheduledAt: Date;
  scheduledEnd?: Date;
  instructions?: string;
  siteArrangesTravel?: boolean;
  travelDetails?: string;
  createdByUserId?: string;
}) {
  const { createdByUserId, ...rest } = data;

  // Conflict check — same mashgiach, overlapping time
  const end = data.scheduledEnd ?? data.scheduledAt;
  const conflict = await prisma.assignment.findFirst({
    where: {
      mashgiachId: data.mashgiachId,
      OR: [
        { scheduledAt: { lte: end }, scheduledEnd: { gte: data.scheduledAt } },
        { scheduledAt: { gte: data.scheduledAt, lte: end } },
      ],
    },
    include: { site: { select: { name: true } } },
  });

  if (conflict) {
    throw new Error(`קונפליקט: המשגיח כבר משובץ ב-${conflict.site.name} בתאריך זה`);
  }

  const assignment = await prisma.assignment.create({ data: rest });

  await prisma.activityLog.create({
    data: {
      organizationId: data.organizationId,
      entityType: "assignment",
      entityId: assignment.id,
      action: "assignment_created",
      description: `שיבוץ חדש נוצר`,
      userId: createdByUserId,
    },
  });

  revalidatePath("/scheduling");
  return assignment;
}

export async function updateAssignmentStatus(
  id: string,
  status: "CREATED" | "SITE_CONFIRMED" | "DEPARTED" | "ARRIVED" | "COMPLETED" | "REPORTED" | "APPROVED",
  userId?: string
) {
  const assignment = await prisma.assignment.update({
    where: { id },
    data: { status },
    include: { site: true },
  });

  await prisma.activityLog.create({
    data: {
      organizationId: assignment.organizationId,
      entityType: "assignment",
      entityId: id,
      action: "status_changed",
      description: `סטטוס שיבוץ שונה ל-${status}`,
      userId,
    },
  });

  revalidatePath("/scheduling");
  return assignment;
}
