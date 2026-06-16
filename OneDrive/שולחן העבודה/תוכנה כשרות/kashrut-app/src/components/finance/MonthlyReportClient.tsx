"use client";

import { useState } from "react";
import { getMonthlyReport } from "@/actions/finance";

const ORG_ID = "org_demo";
const MONTHS_HE = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
const TYPE_LABELS: Record<string, string> = { ANNUAL: "שנתי", LAB: "מעבדה", SPECIFIC: "ספציפי" };

type ReportData = Awaited<ReturnType<typeof getMonthlyReport>>;

export function MonthlyReportClient() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const result = await getMonthlyReport(ORG_ID, month, year);
    setData(result);
    setLoading(false);
  }

  function exportInvoicesExcel() {
    if (!data) return;
    import("xlsx").then(({ utils, writeFile }) => {
      const rows = data.invoices.map((inv) => ({
        "לקוח": inv.client.name,
        "מספר חשבונית": inv.number,
        "סכום": inv.total,
        "סטטוס": inv.status,
        "תאריך יעד": inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("he-IL") : "—",
      }));
      const ws = utils.json_to_sheet(rows);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "חשבוניות");
      writeFile(wb, `invoices-${month}-${year}.xlsx`);
    });
  }

  function exportAssignmentsExcel() {
    if (!data) return;
    import("xlsx").then(({ utils, writeFile }) => {
      const rows = data.assignments.map((a) => ({
        "תאריך": new Date(a.scheduledAt).toLocaleDateString("he-IL"),
        "משגיח": a.mashgiach.name,
        "אתר": a.site.name,
        "מדינה": a.site.country,
        "סוג": TYPE_LABELS[a.project.type] ?? a.project.type,
      }));
      const ws = utils.json_to_sheet(rows);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "שיבוצים");
      writeFile(wb, `assignments-${month}-${year}.xlsx`);
    });
  }

  const totalInvoiced = data?.invoices.reduce((s, i) => s + i.total, 0) ?? 0;
  const totalPaid = data?.invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.total, 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="rounded-xl border bg-white p-5 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">חודש</label>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white">
            {MONTHS_HE.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">שנה</label>
          <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} min={2020} max={2030}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-24" />
        </div>
        <button onClick={load} disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {loading ? "טוען..." : "הצג דוח"}
        </button>
      </div>

      {data && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border bg-white p-4">
              <p className="text-xs text-gray-500 mb-1">חויב החודש</p>
              <p className="text-2xl font-bold text-gray-900">₪{totalInvoiced.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <p className="text-xs text-gray-500 mb-1">התקבל</p>
              <p className="text-2xl font-bold text-green-600">₪{totalPaid.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border bg-white p-4">
              <p className="text-xs text-gray-500 mb-1">שיבוצים</p>
              <p className="text-2xl font-bold text-gray-900">{data.assignments.length}</p>
            </div>
          </div>

          {/* Invoices */}
          <div className="rounded-xl border bg-white overflow-hidden">
            <div className="px-5 py-4 border-b bg-gray-50 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">חשבוניות החודש ({data.invoices.length})</h2>
              <button onClick={exportInvoicesExcel}
                className="text-xs text-green-700 border border-green-300 bg-green-50 px-3 py-1 rounded-lg hover:bg-green-100">
                Excel ↓
              </button>
            </div>
            {data.invoices.length === 0 ? (
              <p className="text-center py-8 text-gray-400">אין חשבוניות לחודש זה</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-start px-4 py-2 text-xs font-medium text-gray-500">לקוח</th>
                    <th className="text-start px-4 py-2 text-xs font-medium text-gray-500">מספר</th>
                    <th className="text-start px-4 py-2 text-xs font-medium text-gray-500">סכום</th>
                    <th className="text-start px-4 py-2 text-xs font-medium text-gray-500">סטטוס</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="px-4 py-2">{inv.client.name}</td>
                      <td className="px-4 py-2 font-mono">{inv.number}</td>
                      <td className="px-4 py-2 font-medium">₪{inv.total.toLocaleString()}</td>
                      <td className="px-4 py-2 text-gray-500">{inv.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Assignments */}
          <div className="rounded-xl border bg-white overflow-hidden">
            <div className="px-5 py-4 border-b bg-gray-50 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">שיבוצים החודש ({data.assignments.length})</h2>
              <button onClick={exportAssignmentsExcel}
                className="text-xs text-green-700 border border-green-300 bg-green-50 px-3 py-1 rounded-lg hover:bg-green-100">
                Excel ↓
              </button>
            </div>
            {data.assignments.length === 0 ? (
              <p className="text-center py-8 text-gray-400">אין שיבוצים לחודש זה</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-start px-4 py-2 text-xs font-medium text-gray-500">תאריך</th>
                    <th className="text-start px-4 py-2 text-xs font-medium text-gray-500">משגיח</th>
                    <th className="text-start px-4 py-2 text-xs font-medium text-gray-500">אתר</th>
                    <th className="text-start px-4 py-2 text-xs font-medium text-gray-500">סוג</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.assignments.map((a) => (
                    <tr key={a.id}>
                      <td className="px-4 py-2">{new Date(a.scheduledAt).toLocaleDateString("he-IL")}</td>
                      <td className="px-4 py-2">{a.mashgiach.name}</td>
                      <td className="px-4 py-2">{a.site.name} · {a.site.country}</td>
                      <td className="px-4 py-2 text-gray-500">{TYPE_LABELS[a.project.type] ?? a.project.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
