import Link from "next/link";
import { getHologramBatches, getHologramInventorySummary } from "@/actions/holograms";

const ORG_ID = "org_demo";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("he-IL").format(new Date(d));
}

export default async function HologramsPage() {
  const [batches, summary] = await Promise.all([
    getHologramBatches(ORG_ID).catch(() => []),
    getHologramInventorySummary(ORG_ID).catch(() => ({
      totalIssued: 0, totalAllocated: 0, totalUsed: 0, available: 0, allocated: 0,
    })),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ניהול הולוגרמות</h1>
        <Link href="/holograms/new" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + קבלת מנה חדשה
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "סה\"כ הונפקו", value: summary.totalIssued, color: "bg-blue-50 text-blue-700" },
          { label: "זמינות לחלוקה", value: summary.available, color: "bg-green-50 text-green-700" },
          { label: "מוקצות לפרויקטים", value: summary.allocated, color: "bg-amber-50 text-amber-700" },
          { label: "נוצלו בפועל", value: summary.totalUsed, color: "bg-gray-50 text-gray-700" },
        ].map((card) => (
          <div key={card.label} className={`rounded-xl p-4 ${card.color}`}>
            <p className="text-xs font-medium opacity-70">{card.label}</p>
            <p className="text-3xl font-bold mt-1">{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Batches table */}
      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="px-5 py-3 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-700 text-sm">מנות הולוגרמות</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-start px-4 py-3 font-medium text-gray-600">טווח מספרים</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">כמות</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">מוקצות</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">נוצלו</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">זמינות</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">תאריך קבלה</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {batches.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  אין מנות הולוגרמות — <Link href="/holograms/new" className="text-blue-600 hover:underline">הוסף את הראשונה</Link>
                </td>
              </tr>
            )}
            {batches.map((batch) => {
              const total = batch.rangeTo - batch.rangeFrom + 1;
              const allocated = batch.allocations.reduce((sum, a) => sum + (a.rangeTo - a.rangeFrom + 1), 0);
              const used = batch.allocations.reduce((sum, a) =>
                sum + a.usages.reduce((s, u) => s + (u.rangeTo - u.rangeFrom + 1), 0), 0);
              const available = total - allocated;

              return (
                <tr key={batch.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-medium">
                    {batch.rangeFrom.toLocaleString()} – {batch.rangeTo.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{total.toLocaleString()}</td>
                  <td className="px-4 py-3 text-amber-600">{allocated.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500">{used.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${available > 0 ? "text-green-600" : "text-red-500"}`}>
                      {available.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(batch.receivedAt)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/holograms/${batch.id}`} className="text-blue-600 hover:underline text-xs">פרטים</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
