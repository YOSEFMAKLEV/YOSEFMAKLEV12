"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CertificateStatus } from "@/generated/prisma/client";

export async function getCertificates(organizationId: string) {
  return prisma.certificate.findMany({
    where: { organizationId },
    include: {
      client: { select: { id: true, name: true, certRelease: true } },
      project: { select: { id: true, type: true, site: { select: { name: true } } } },
      certBody: { select: { id: true, name: true } },
    },
    orderBy: { issuedAt: "desc" },
  });
}

export async function issueCertificate(data: {
  organizationId: string;
  projectId: string;
  clientId: string;
  certBodyId?: string;
  expiresAt: Date;
  createdByUserId?: string;
}) {
  const { createdByUserId, ...rest } = data;

  // Check client cert release policy
  const client = await prisma.client.findUnique({
    where: { id: data.clientId },
    select: { certRelease: true, name: true },
  });

  const status: CertificateStatus =
    client?.certRelease === "AFTER_PAYMENT" ? "WAITING_PAYMENT" : "READY_TO_SEND";

  const cert = await prisma.certificate.create({
    data: { ...rest, status },
  });

  // Update project status
  await prisma.project.update({
    where: { id: data.projectId },
    data: { status: "CERTIFIED" },
  });

  await prisma.activityLog.create({
    data: {
      organizationId: data.organizationId,
      entityType: "certificate",
      entityId: cert.id,
      action: "certificate_issued",
      description: `תעודה הונפקה — סטטוס: ${status === "WAITING_PAYMENT" ? "ממתין לתשלום" : "מוכן לשליחה"}`,
      userId: createdByUserId,
      clientId: data.clientId,
    },
  });

  // Alert if waiting for payment
  if (status === "WAITING_PAYMENT") {
    await prisma.alert.create({
      data: {
        organizationId: data.organizationId,
        type: "CERT_NOT_SENT",
        severity: "IMPORTANT",
        title: "תעודה ממתינה לתשלום",
        description: `תעודה ל${client?.name} ממתינה לאישור תשלום לפני שחרור`,
        entityType: "certificate",
        entityId: cert.id,
      },
    });
  }

  revalidatePath("/certificates");
  return cert;
}

export async function releaseCertificate(id: string, userId?: string) {
  const cert = await prisma.certificate.update({
    where: { id },
    data: { status: "READY_TO_SEND" },
    include: { client: true },
  });

  await prisma.activityLog.create({
    data: {
      organizationId: cert.organizationId,
      entityType: "certificate",
      entityId: id,
      action: "updated",
      description: "תעודה שוחררה לשליחה",
      userId,
      clientId: cert.clientId,
    },
  });

  revalidatePath("/certificates");
  return cert;
}

export async function markCertificateSent(id: string, via: "email" | "whatsapp" | "manual", userId?: string) {
  const cert = await prisma.certificate.update({
    where: { id },
    data: {
      status: via === "manual" ? "SENT_MANUALLY" : "SENT",
      sentAt: new Date(),
      sentVia: via,
    },
    include: { client: true },
  });

  await prisma.activityLog.create({
    data: {
      organizationId: cert.organizationId,
      entityType: "certificate",
      entityId: id,
      action: "certificate_issued",
      description: `תעודה נשלחה ב-${via}`,
      userId,
      clientId: cert.clientId,
    },
  });

  revalidatePath("/certificates");
  return cert;
}

export async function getExpiringCertificates(organizationId: string, withinDays = 90) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + withinDays);

  return prisma.certificate.findMany({
    where: {
      organizationId,
      status: { in: ["SENT", "SENT_MANUALLY", "READY_TO_SEND"] },
      expiresAt: { lte: cutoff, gte: new Date() },
    },
    include: {
      client: { select: { id: true, name: true } },
      project: { select: { id: true, site: { select: { name: true } } } },
      certBody: { select: { name: true } },
    },
    orderBy: { expiresAt: "asc" },
  });
}
