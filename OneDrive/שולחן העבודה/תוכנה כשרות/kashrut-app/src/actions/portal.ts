"use server";

import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

// ─── Token generation ─────────────────────────────────────────────────────────

export async function generateClientPortalToken(clientId: string) {
  const token = randomBytes(32).toString("hex");
  await prisma.client.update({ where: { id: clientId }, data: { portalToken: token } });
  return token;
}

export async function generateSiteAccessToken(siteId: string) {
  const token = randomBytes(32).toString("hex");
  await prisma.site.update({ where: { id: siteId }, data: { accessToken: token } });
  return token;
}

// ─── Importer portal ──────────────────────────────────────────────────────────

export async function getImporterPortalData(token: string) {
  const client = await prisma.client.findUnique({
    where: { portalToken: token },
    include: {
      projects: {
        orderBy: { createdAt: "desc" },
        include: { site: { select: { id: true, name: true, country: true } }, certBody: { select: { name: true } } },
      },
      certificates: {
        orderBy: { issuedAt: "desc" },
        include: { project: { select: { site: { select: { name: true } } } }, certBody: { select: { name: true } } },
      },
      invoices: {
        orderBy: { createdAt: "desc" },
        include: { project: { select: { site: { select: { name: true } } } } },
      },
    },
  });
  return client;
}

// ─── Business / factory portal ────────────────────────────────────────────────

export async function getBusinessPortalData(token: string) {
  const site = await prisma.site.findUnique({
    where: { accessToken: token },
    include: {
      client: { select: { id: true, name: true } },
      products: {
        include: {
          rawMaterials: { orderBy: { name: "asc" } },
          labelApprovals: { orderBy: { version: "desc" }, take: 1 },
        },
      },
      projects: {
        where: { status: { in: ["PENDING", "ACTIVE"] } },
        orderBy: { createdAt: "desc" },
        include: { certBody: { select: { name: true } } },
      },
      assignments: {
        where: { scheduledAt: { gte: new Date() } },
        orderBy: { scheduledAt: "asc" },
        take: 10,
        include: { mashgiach: { select: { name: true } } },
      },
    },
  });
  return site;
}

// ─── Site confirmation (from siteConfirmToken on Assignment) ──────────────────

export async function confirmSiteAssignment(token: string) {
  const assignment = await prisma.assignment.findUnique({
    where: { siteConfirmToken: token },
  });
  if (!assignment) return { ok: false, message: "קישור לא תקין" };
  if (assignment.status !== "CREATED") return { ok: true, alreadyConfirmed: true };
  await prisma.assignment.update({
    where: { id: assignment.id },
    data: { status: "SITE_CONFIRMED", siteConfirmedAt: new Date() },
  });
  return { ok: true, alreadyConfirmed: false };
}
