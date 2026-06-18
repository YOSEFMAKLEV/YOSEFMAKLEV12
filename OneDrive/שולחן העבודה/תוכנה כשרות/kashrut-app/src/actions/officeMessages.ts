"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function sendOfficeMessage({
  organizationId,
  mashgiachId,
  body,
  attachments = [],
}: {
  organizationId: string;
  mashgiachId: string;
  body: string;
  attachments?: string[];
}) {
  const mashgiach = await prisma.mashgiach.findUnique({
    where: { id: mashgiachId },
    select: { name: true },
  });

  const msg = await prisma.officeMessage.create({
    data: { organizationId, mashgiachId, body, attachments },
  });

  await prisma.alert.create({
    data: {
      organizationId,
      type: "OFFICE_MESSAGE",
      severity: "INFO",
      title: `הודעה ממשגיח: ${mashgiach?.name ?? ""}`,
      description: body.length > 80 ? body.slice(0, 80) + "…" : body,
      entityType: "mashgiach",
      entityId: mashgiachId,
    },
  });

  revalidatePath("/mashgichim");
  return msg;
}

export async function getOfficeMessagesForMashgiach(mashgiachId: string) {
  return prisma.officeMessage.findMany({
    where: { mashgiachId },
    orderBy: { createdAt: "desc" },
  });
}

export async function markMessageRead(messageId: string, readBy?: string) {
  await prisma.officeMessage.update({
    where: { id: messageId },
    data: { status: "READ", readAt: new Date(), readBy },
  });
}
