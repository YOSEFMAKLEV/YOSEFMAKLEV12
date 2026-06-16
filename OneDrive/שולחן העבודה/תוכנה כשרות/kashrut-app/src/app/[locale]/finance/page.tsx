import { getInvoices, getFinanceSummary, getDebtReport } from "@/actions/finance";
import { getPayrollEntries } from "@/actions/finance";
import Link from "next/link";
import { FinanceTabs } from "@/components/finance/FinanceTabs";

const ORG_ID = "org_demo";

export default async function FinancePage() {
  const now = new Date();
  const [summary, invoices, debtReport, payroll] = await Promise.all([
    getFinanceSummary(ORG_ID).catch(() => null),
    getInvoices(ORG_ID).catch(() => []),
    getDebtReport(ORG_ID).catch(() => []),
    getPayrollEntries(ORG_ID, now.getMonth() + 1, now.getFullYear()).catch(() => []),
  ]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">כספים</h1>
        <Link href="/finance/invoices/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + חשבונית חדשה
        </Link>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-gray-500 mb-1">יתרת חובות</p>
            <p className="text-xl font-bold text-gray-900">₪{summary.totalReceivable.toLocaleString()}</p>
          </div>
          <div className={`rounded-xl border p-4 ${summary.overdue > 0 ? "bg-red-50 border-red-200" : "bg-white"}`}>
            <p className="text-xs text-gray-500 mb-1">באיחור</p>
            <p className={`text-xl font-bold ${summary.overdue > 0 ? "text-red-600" : "text-gray-900"}`}>
              ₪{summary.overdue.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-gray-500 mb-1">התקבל החודש</p>
            <p className="text-xl font-bold text-green-600">₪{summary.paidThisMonth.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-gray-500 mb-1">שכר החודש</p>
            <p className="text-xl font-bold text-gray-900">₪{summary.totalPayrollThisMonth.toLocaleString()}</p>
          </div>
          <div className={`rounded-xl border p-4 ${summary.pendingPayroll > 0 ? "bg-yellow-50 border-yellow-200" : "bg-white"}`}>
            <p className="text-xs text-gray-500 mb-1">שכר ממתין</p>
            <p className={`text-xl font-bold ${summary.pendingPayroll > 0 ? "text-yellow-700" : "text-gray-900"}`}>
              ₪{summary.pendingPayroll.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      <FinanceTabs invoices={invoices} debtReport={debtReport} payroll={payroll} />
    </div>
  );
}
