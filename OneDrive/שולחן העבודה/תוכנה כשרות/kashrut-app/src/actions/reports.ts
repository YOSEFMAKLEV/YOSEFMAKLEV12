"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAssignmentWithReport(assignmentId: string) {
  return prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      mashgiach: true,
      site: true,
      project: {
        include: {
          client: true,
          certBody: true,
        },
      },
      reports: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

export async function saveReport(data: {
  assignmentId: string;
  checkIn?: Date;
  checkOut?: Date;
  internalNotes?: string;
  rabbinateNotes?: string;
  findings?: string;
  issues?: string;
  hologramFrom?: number;
  hologramTo?: number;
  signature?: string;
  status?: "DRAFT" | "SUBMITTED";
}) {
  const existing = await prisma.assignmentReport.findFirst({
    where: { assignmentId: data.assignmentId },
    orderBy: { createdAt: "desc" },
  });

  let report;
  if (existing) {
    report = await prisma.assignmentReport.update({
      where: { id: existing.id },
      data,
    });
  } else {
    report = await prisma.assignmentReport.create({ data });
  }

  if (data.status === "SUBMITTED") {
    await prisma.assignment.update({
      where: { id: data.assignmentId },
      data: { status: "REPORTED" },
    });
  }

  revalidatePath(`/scheduling/${data.assignmentId}`);
  return report;
}
