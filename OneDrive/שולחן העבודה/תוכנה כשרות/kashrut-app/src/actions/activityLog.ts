"use server";

import { prisma } from "@/lib/prisma";

export async function getActivityLogs(
  organizationId: string,
  options?: { limit?: number; action?: string }
) {
  return prisma.activityLog.findMany({
    where: {
      organizationId,
      ...(options?.action ? { action: options.action } : {}),
    },
    include: {
      user: { select: { name: true, role: true } },
      client: { select: { name: true } },
      site: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 200,
  });
}
