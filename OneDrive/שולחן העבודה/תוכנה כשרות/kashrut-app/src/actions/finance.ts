"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ─── Invoices ─────────────────────────────────────────────────────────────────

export async function getInvoices(organizationId: string, status?: string) {
  return prisma.invoice.findMany({
    where: {
      organizationId,
      ...(status ? { status: status as never } : {}),
    },
    include: {
      client: { select: { id: true, name: true } },
      project: { select: { id: true, site: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createInvoice(data: {
  organizationId: string;
  clientId: string;
  projectId?: string;
  number: string;
  items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  total: number;
  dueDate?: Date;
  releaseCertOnPayment?: boolean;
}) {
  const invoice = await prisma.invoice.create({
    data: {
      organizationId: data.organizationId,
      clientId: data.clientId,
      projectId: data.projectId,
      number: data.number,
      items: data.items,
      total: data.total,
      dueDate: data.dueDate,
      releaseCertOnPayment: data.releaseCertOnPayment ?? false,
    },
  });
  revalidatePath("/finance");
  return invoice;
}

export async function updateInvoiceStatus(
  id: string,
  status: "PENDING" | "PAID" | "OVERDUE" | "PARTIAL",
  paidAmount?: number
) {
  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      status,
      ...(status === "PAID" ? { paidAt: new Date(), paidAmount: paidAmount } : {}),
      ...(paidAmount !== undefined && status === "PARTIAL" ? { paidAmount } : {}),
    },
  });

  // If this invoice releases a certificate on payment
  if ((status === "PAID" || status === "PARTIAL") && invoice.releaseCertOnPayment && invoice.projectId) {
    await prisma.certificate.updateMany({
      where: { projectId: invoice.projectId, status: "WAITING_PAYMENT" },
      data: { status: "READY_TO_SEND" },
    });
  }

  revalidatePath("/finance");
  revalidatePath("/certificates");
  return invoice;
}

// ─── Payroll ──────────────────────────────────────────────────────────────────

export async function getPayrollEntries(organizationId: string, month?: number, year?: number) {
  const mashgichim = await prisma.mashgiach.findMany({
    where: { organizationId, isActive: true },
    select: { id: true, name: true },
  });
  const mashgiachIds = mashgichim.map((m) => m.id);

  const entries = await prisma.payrollEntry.findMany({
    where: {
      mashgiachId: { in: mashgiachIds },
      ...(month !== undefined && year !== undefined ? { month, year } : {}),
    },
    include: { mashgiach: { select: { id: true, name: true, salaryModel: true, salaryRate: true } } },
    orderBy: [{ year: "desc" }, { month: "desc" }, { mashgiach: { name: "asc" } }],
  });

  return entries;
}

export async function createPayrollEntry(data: {
  mashgiachId: string;
  month: number;
  year: number;
  hoursWorked?: number;
  baseAmount: number;
  expenses?: number;
  total: number;
  notes?: string;
}) {
  const entry = await prisma.payrollEntry.create({ data: { ...data, expenses: data.expenses ?? 0 } });
  revalidatePath("/finance");
  return entry;
}

export async function updatePayrollStatus(
  id: string,
  status: "PENDING" | "APPROVED" | "PAID"
) {
  const entry = await prisma.payrollEntry.update({
    where: { id },
    data: { status, ...(status === "PAID" ? { paidAt: new Date() } : {}) },
  });
  revalidatePath("/finance");
  return entry;
}

// ─── Reports / Stats ──────────────────────────────────────────────────────────

export async function getFinanceSummary(organizationId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [invoices, payroll] = await Promise.all([
    prisma.invoice.findMany({
      where: { organizationId },
      select: { total: true, status: true, paidAmount: true, dueDate: true },
    }),
    prisma.payrollEntry.findMany({
      where: {
        mashgiach: { organizationId },
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
      select: { total: true, status: true },
    }),
  ]);

  const totalReceivable = invoices
    .filter((i) => i.status !== "PAID")
    .reduce((s, i) => s + i.total - (i.paidAmount ?? 0), 0);

  const overdue = invoices
    .filter((i) => i.status !== "PAID" && i.dueDate && new Date(i.dueDate) < now)
    .reduce((s, i) => s + i.total - (i.paidAmount ?? 0), 0);

  const paidThisMonth = invoices
    .filter((i) => i.status === "PAID" && i.paidAmount !== null)
    .reduce((s, i) => s + (i.paidAmount ?? 0), 0);

  const totalPayrollThisMonth = payroll.reduce((s, p) => s + p.total, 0);
  const pendingPayroll = payroll
    .filter((p) => p.status === "PENDING" || p.status === "APPROVED")
    .reduce((s, p) => s + p.total, 0);

  return { totalReceivable, overdue, paidThisMonth, totalPayrollThisMonth, pendingPayroll };
}

export async function getDebtReport(organizationId: string) {
  return prisma.invoice.findMany({
    where: { organizationId, status: { in: ["PENDING", "OVERDUE", "PARTIAL"] } },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
      project: { select: { id: true, site: { select: { name: true } } } },
    },
    orderBy: { dueDate: "asc" },
  });
}

export async function getMonthlyReport(organizationId: string, month: number, year: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const [invoices, assignments] = await Promise.all([
    prisma.invoice.findMany({
      where: { organizationId, createdAt: { gte: startDate, lte: endDate } },
      include: { client: { select: { name: true } } },
    }),
    prisma.assignment.findMany({
      where: { organizationId, scheduledAt: { gte: startDate, lte: endDate } },
      include: {
        mashgiach: { select: { name: true } },
        site: { select: { name: true, country: true } },
        project: { select: { type: true } },
      },
    }),
  ]);

  return { invoices, assignments };
}
