"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const FIELD_LABELS: Record<string, string> = {
  phone: "טלפון",
  email: "אימייל",
  city: "עיר מגורים",
  nameEn: "שם באנגלית",
};

export async function createProfileEditRequest({
  organizationId,
  mashgiachId,
  requestType,
  field,
  oldValue,
  newValue,
  extraData,
}: {
  organizationId: string;
  mashgiachId: string;
  requestType: "CHANGE" | "ADD";
  field: string;
  oldValue?: string;
  newValue: string;
  extraData?: string;
}) {
  const mashgiach = await prisma.mashgiach.findUnique({
    where: { id: mashgiachId },
    select: { name: true },
  });

  const req = await prisma.profileEditRequest.create({
    data: {
      organizationId,
      mashgiachId,
      requestType,
      field,
      oldValue: oldValue || null,
      newValue,
      extraData: extraData || null,
    },
  });

  const fieldLabel = FIELD_LABELS[field] ?? field;
  const typeLabel = requestType === "ADD" ? "הוספת" : "שינוי";

  await prisma.alert.create({
    data: {
      organizationId,
      type: "PROFILE_CHANGE_REQUEST",
      severity: "INFO",
      title: `בקשת ${typeLabel} ${fieldLabel} — ${mashgiach?.name}`,
      description: requestType === "ADD"
        ? `המשגיח מבקש להוסיף ${fieldLabel}: ${newValue}`
        : `המשגיח מבקש לשנות ${fieldLabel} מ-"${oldValue || "—"}" ל-"${newValue}"`,
      entityType: "profileEditRequest",
      entityId: req.id,
    },
  });

  revalidatePath("/mashgiach/profile");
  revalidatePath("/alerts");
  return req;
}

export async function getPendingEditRequests(mashgiachId: string) {
  return prisma.profileEditRequest.findMany({
    where: { mashgiachId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllEditRequests(organizationId: string) {
  return prisma.profileEditRequest.findMany({
    where: { organizationId },
    include: { mashgiach: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function approveEditRequest(requestId: string, adminUserId?: string) {
  const req = await prisma.profileEditRequest.update({
    where: { id: requestId },
    data: { status: "APPROVED", resolvedAt: new Date(), resolvedBy: adminUserId },
    include: { mashgiach: true },
  });

  const update: Record<string, unknown> = {};
  if (req.field === "phone") update.phone = req.newValue;
  else if (req.field === "email") update.email = req.newValue;
  else if (req.field === "city") update.city = req.newValue;
  else if (req.field === "nameEn") update.nameEn = req.newValue;

  if (Object.keys(update).length > 0) {
    await prisma.mashgiach.update({
      where: { id: req.mashgiachId },
      data: update,
    });
  }

  await dismissAlertForRequest(requestId, req.organizationId);
  revalidatePath("/mashgiach/profile");
  revalidatePath(`/mashgichim/${req.mashgiachId}`);
  revalidatePath("/alerts");
  return req;
}

export async function rejectEditRequest(requestId: string, adminNotes?: string, adminUserId?: string) {
  const req = await prisma.profileEditRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED", resolvedAt: new Date(), resolvedBy: adminUserId, adminNotes },
  });

  await dismissAlertForRequest(requestId, req.organizationId);
  revalidatePath("/mashgiach/profile");
  revalidatePath("/alerts");
  return req;
}

async function dismissAlertForRequest(requestId: string, organizationId: string) {
  await prisma.alert.updateMany({
    where: { organizationId, entityType: "profileEditRequest", entityId: requestId },
    data: { isDismissed: true },
  });
}
