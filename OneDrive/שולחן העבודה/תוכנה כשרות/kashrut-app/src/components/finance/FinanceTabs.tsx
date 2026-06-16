"use client";

import { useState } from "react";
import { updateInvoiceStatus, updatePayrollStatus } from "@/actions/finance";
import { useRouter } from "next/navigation";

type Invoice = {
  id: string; number: string; total: number; status: string;
  paidAmount: number | null; dueDate: Date | null; createdAt: Date;
  client: { id: string; name: string };
  project: { id: string; site: { name: string } } | null;
};
type Debt = Invoice & { client: { id: string; name: string; email: string | null; phone: string | null } };
type Payroll = {
  id: string; month: number; year: number; hoursWorked: number | null;
  baseAmount: number; expenses: number; total: number; status: string;
  paidAt: Date | null; notes: string | null;
  mashgiach: { id: string; name: string; salaryModel: string | null; salaryRate: number | null };
};

const INVOICE_STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין", PAID: "שולם", OVERDUE: "באיחור", PARTIAL: "שולם חלקית",
};
const PAYROLL_STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין", APPROVED: "אושר", PAID: "שולם",
};
const MONTHS_HE = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

export function FinanceTabs({
  invoices, debtReport, payroll
}: {
  invoices: Invoice[];
  debtReport: Debt[];
  payroll: Payroll[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"invoices" | "payroll" | "debt">("invoices");

  async function markInvoice(id: string, status: "PAID" | "OVERDUE" | "PARTIAL") {
    await updateInvoiceStatus(id, status);
    router.refresh();
  }

  async function markPayroll(id: string, status: "APPROVED" | "PAID") {
    await updatePayrollStatus(id, status);
    router.refresh();
  }

  function exportDebtExcel() {
    import("xlsx").then(({ utils, writeFile }) => {
      const rows = debtReport.map((inv) => ({
        "לקוח": inv.client.name,
        "אתר": inv.project?.site?.name ?? "—",
        "מספר חשבונית": inv.number,
        "סכום": inv.total,
        "שולם": inv.paidAmount ?? 0,
        "יתרה": inv.total - (inv.paidAmount ?? 0),
        "תאריך יעד": inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("he-IL") : "—",
        "סטטוס": INVOICE_STATUS_LABELS[inv.status] ?? inv.status,
        "טלפון": inv.client.phone ?? "—",
        "מייל": inv.client.email ?? "—",
      }));
      const ws = utils.json_to_sheet(rows);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "חובות פתוחים");
      writeFile(wb, "debt-report.xlsx");
    });
  }

  function exportPayrollExcel() {
    import("xlsx").then(({ utils, writeFile }) => {
      const rows = payroll.map((p) => ({
        "משגיח": p.mashgiach.name,
        "חודש": `${MONTHS_HE[p.month - 1]} ${p.year}`,
        "שעות": p.hoursWorked ?? "—",
        "בסיס": p.baseAmount,
        "הוצאות": p.expenses,
        "סה\"כ": p.total,
        "סטטוס": PAYROLL_STATUS_LABELS[p.status] ?? p.status,
        "הערות": p.notes ?? "",
      }));
      const ws = utils.json_to_sheet(rows);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "שכר משגיחים");
      writeFile(wb, `payroll-${payroll[0]?.month ?? ""}-${payroll[0]?.year ?? ""}.xlsx`);
    });
  }

  const tabs = [
    { id: "invoices" as const, label: `חשבוניות (${invoices.length})` },
    { id: "debt" as const, label: `חובות פתוחים (${debtReport.length})` },
    { id: "payroll" as const, label: `שכר משגיחים (${payroll.length})` },
  ];

  return (
    <div>
      <div className="flex gap-1 border-b mb-6">
        {tabs.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Invoices tab */}
      {tab === "invoices" && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-start px-4 py-3 font-medium text-gray-600">מספר</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">לקוח</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">אתר</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">סכום</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">תאריך יעד</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">סטטוס</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">אין חשבוניות עדיין</td></tr>
              )}
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-4 py-3 font-mono font-medium">{inv.number}</td>
                  <td className="px-4 py-3">{inv.client.name}</td>
                  <td className="px-4 py-3 text-gray-500">{inv.project?.site?.name ?? "—"}</td>
                  <td className="px-4 py-3 font-medium">₪{inv.total.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("he-IL") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      inv.status === "PAID" ? "bg-green-100 text-green-700" :
                      inv.status === "OVERDUE" ? "bg-red-100 text-red-700" :
                      inv.status === "PARTIAL" ? "bg-blue-100 text-blue-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {INVOICE_STATUS_LABELS[inv.status] ?? inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {inv.status !== "PAID" && (
                      <div className="flex gap-1">
                        <button onClick={() => markInvoice(inv.id, "PAID")}
                          className="text-xs text-green-600 hover:underline">שולם</button>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => markInvoice(inv.id, "OVERDUE")}
                          className="text-xs text-red-500 hover:underline">באיחור</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Debt report tab */}
      {tab === "debt" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={exportDebtExcel}
              className="rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100">
              ייצוא Excel
            </button>
          </div>
          <div className="rounded-xl border bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">לקוח</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">חשבונית</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">יתרה</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">תאריך יעד</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">טלפון</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {debtReport.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">אין חובות פתוחים</td></tr>
                )}
                {debtReport.map((inv) => {
                  const remaining = inv.total - (inv.paidAmount ?? 0);
                  const overdue = inv.dueDate && new Date(inv.dueDate) < new Date();
                  return (
                    <tr key={inv.id} className={overdue ? "bg-red-50" : ""}>
                      <td className="px-4 py-3 font-medium">{inv.client.name}</td>
                      <td className="px-4 py-3 font-mono text-gray-600">{inv.number}</td>
                      <td className={`px-4 py-3 font-bold ${overdue ? "text-red-600" : "text-gray-900"}`}>
                        ₪{remaining.toLocaleString()}
                      </td>
                      <td className={`px-4 py-3 ${overdue ? "text-red-500 font-medium" : "text-gray-500"}`}>
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("he-IL") : "—"}
                        {overdue && " ⚠"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{inv.client.phone ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payroll tab */}
      {tab === "payroll" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={exportPayrollExcel}
              className="rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100">
              ייצוא Excel
            </button>
          </div>
          <div className="rounded-xl border bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">משגיח</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">חודש</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">שעות</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">בסיס</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">הוצאות</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">סה"כ</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">סטטוס</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payroll.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-8 text-gray-400">אין ערכי שכר לחודש זה</td></tr>
                )}
                {payroll.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium">{p.mashgiach.name}</td>
                    <td className="px-4 py-3 text-gray-500">{MONTHS_HE[p.month - 1]} {p.year}</td>
                    <td className="px-4 py-3 text-gray-500">{p.hoursWorked ?? "—"}</td>
                    <td className="px-4 py-3">₪{p.baseAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500">₪{p.expenses.toLocaleString()}</td>
                    <td className="px-4 py-3 font-bold">₪{p.total.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.status === "PAID" ? "bg-green-100 text-green-700" :
                        p.status === "APPROVED" ? "bg-blue-100 text-blue-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {PAYROLL_STATUS_LABELS[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.status === "PENDING" && (
                        <button onClick={() => markPayroll(p.id, "APPROVED")}
                          className="text-xs text-blue-600 hover:underline">אשר</button>
                      )}
                      {p.status === "APPROVED" && (
                        <button onClick={() => markPayroll(p.id, "PAID")}
                          className="text-xs text-green-600 hover:underline">שולם</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
