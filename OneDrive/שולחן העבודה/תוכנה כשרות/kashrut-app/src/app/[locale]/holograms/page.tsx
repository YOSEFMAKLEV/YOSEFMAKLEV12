import Link from "next/link";
import { getHologramBatches, getHologramInventorySummary, getTransfers, getAllMashgiachimBalances } from "@/actions/holograms";
import { prisma } from "@/lib/prisma";
import { SendTransferForm } from "@/components/holograms/SendTransferForm";
import { ConfirmTransferButton, RejectTransferButton, CancelTransferButton } from "@/components/holograms/TransferActions";

const ORG_ID = "org_demo";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("he-IL").format(new Date(d));
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-100 text-gray-500",
  };
  const label: Record<string, string> = {
    PENDING: "ממתין לאישור",
    CONFIRMED: "אושר",
    REJECTED: "נדחה",
    CANCELLED: "בוטל",
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {label[status] ?? status}
    </span>
  );
}

function CertBodyTag({ name }: { name: string | null | undefined }) {
  if (!name) return <span className="text-gray-300">—</span>;
  return (
    <span className="inline-block rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-semibold text-blue-700">
      {name}
    </span>
  );
}

export default async function HologramsPage() {
  const [batches, summary, transfers, balances, mashgichim, certBodies] = await Promise.all([
    getHologramBatches(ORG_ID).catch(() => [] as Awaited<ReturnType<typeof getHologramBatches>>),
    getHologramInventorySummary(ORG_ID).catch(() => ({
      totalIssued: 0, totalAllocated: 0, totalUsed: 0, available: 0, allocated: 0,
    })),
    getTransfers(ORG_ID).catch(() => []),
    getAllMashgiachimBalances(ORG_ID).catch(() => ({} as Awaited<ReturnType<typeof getAllMashgiachimBalances>>)),
    prisma.mashgiach.findMany({
      where: { organizationId: ORG_ID, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }).catch(() => []),
    prisma.certBody.findMany({
      where: { organizationId: ORG_ID, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }).catch(() => []),
  ]);

  const pendingTransfers = transfers.filter((t) => t.status === "PENDING");
  const historyTransfers = transfers.filter((t) => t.status !== "PENDING");

  const totalAtMashgichim = Object.values(balances).reduce((s, m) => s + Math.max(0, m.total), 0);
  const orgAvailable = summary.totalIssued - totalAtMashgichim;

  // Summary by cert body (from batches)
  const byCertBody: Record<string, { name: string; total: number; atMashgichim: number }> = {};
  for (const b of batches) {
    const key = b.certBody?.id ?? "unknown";
    const name = b.certBody?.name ?? "לא ידוע";
    const total = b.rangeTo - b.rangeFrom + 1;
    if (!byCertBody[key]) byCertBody[key] = { name, total: 0, atMashgichim: 0 };
    byCertBody[key].total += total;
  }
  // Add mashgiach distribution per cert body
  for (const m of Object.values(balances)) {
    for (const [cbId, cb] of Object.entries(m.byCertBody)) {
      if (!byCertBody[cbId]) byCertBody[cbId] = { name: cb.name, total: 0, atMashgichim: 0 };
      byCertBody[cbId].atMashgichim += Math.max(0, cb.balance);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">ניהול הולוגרמות</h1>
        <div className="flex gap-2">
          <SendTransferForm
            orgId={ORG_ID}
            batches={batches.map((b) => ({ id: b.id, rangeFrom: b.rangeFrom, rangeTo: b.rangeTo, notes: b.notes, certBodyName: b.certBody?.name }))}
            mashgichim={mashgichim}
          />
          <Link href="/holograms/new" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            + קבלת מנה חדשה
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "סה\"כ הונפקו", value: summary.totalIssued, color: "bg-blue-50 text-blue-700" },
          { label: "במשרד", value: orgAvailable, color: "bg-green-50 text-green-700" },
          { label: "אצל משגיחים", value: totalAtMashgichim, color: "bg-purple-50 text-purple-700" },
          { label: "נוצלו בפועל", value: summary.totalUsed, color: "bg-gray-50 text-gray-700" },
        ].map((card) => (
          <div key={card.label} className={`rounded-xl p-4 ${card.color}`}>
            <p className="text-xs font-medium opacity-70">{card.label}</p>
            <p className="text-3xl font-bold mt-1">{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* By cert body */}
      {Object.keys(byCertBody).length > 0 && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <div className="px-5 py-3 border-b bg-blue-50">
            <h2 className="font-semibold text-blue-800 text-sm">סיכום לפי גוף כשרות</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {Object.entries(byCertBody).map(([id, cb]) => (
              <div key={id} className="flex items-center gap-4 px-5 py-3">
                <CertBodyTag name={cb.name} />
                <div className="flex-1 flex gap-6 text-sm">
                  <span className="text-gray-600">סה"כ: <span className="font-bold text-gray-800">{cb.total.toLocaleString()}</span></span>
                  <span className="text-purple-600">אצל משגיחים: <span className="font-bold">{cb.atMashgichim.toLocaleString()}</span></span>
                  <span className="text-green-600">במשרד: <span className="font-bold">{Math.max(0, cb.total - cb.atMashgichim).toLocaleString()}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mashgiach balances */}
      {Object.keys(balances).length > 0 && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <div className="px-5 py-3 border-b bg-purple-50">
            <h2 className="font-semibold text-purple-800 text-sm">מלאי אצל משגיחים</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {Object.entries(balances).map(([id, m]) => (
              <div key={id} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-800 text-sm">{m.name}</span>
                  <span className={`text-sm font-bold ${m.total > 0 ? "text-purple-600" : "text-gray-400"}`}>
                    סה"כ: {m.total.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(m.byCertBody).map(([cbId, cb]) => (
                    cb.balance > 0 && (
                      <span key={cbId} className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs">
                        <span className="font-semibold text-blue-700">{cb.name}</span>
                        <span className="text-blue-500">{cb.balance.toLocaleString()}</span>
                      </span>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending transfers */}
      {pendingTransfers.length > 0 && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <div className="px-5 py-3 border-b bg-amber-50">
            <h2 className="font-semibold text-amber-800 text-sm">
              ממתינות לאישור ({pendingTransfers.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingTransfers.map((t) => {
              const qty = t.rangeTo - t.rangeFrom + 1;
              const from = t.fromType === "ORG" ? "המשרד" : (t.fromMashgiach?.name ?? "?");
              const to = t.toType === "ORG" ? "המשרד" : (t.toMashgiach?.name ?? "?");
              return (
                <div key={t.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-gray-800">{from} → {to}</span>
                      <CertBodyTag name={t.batch.certBody?.name} />
                    </div>
                    <p className="text-xs text-gray-500">
                      {qty.toLocaleString()} מדבקות · {t.rangeFrom.toLocaleString()}–{t.rangeTo.toLocaleString()} · {formatDate(t.sentAt)}
                      {t.notes && ` · ${t.notes}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {t.fromType === "ORG" && <CancelTransferButton transferId={t.id} />}
                    {t.toType === "ORG" && (
                      <>
                        <ConfirmTransferButton transferId={t.id} />
                        <RejectTransferButton transferId={t.id} />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Batches table */}
      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="px-5 py-3 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-700 text-sm">מנות הולוגרמות</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-start px-4 py-3 font-medium text-gray-600">גוף כשרות</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">טווח מספרים</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">כמות</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">מוקצות</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">נוצלו</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">זמינות</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">תאריך קבלה</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">הערות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {batches.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">
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
                  <td className="px-4 py-3">
                    <CertBodyTag name={batch.certBody?.name} />
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-sm">
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
                  <td className="px-4 py-3 text-gray-500 text-xs">{batch.notes ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Transfer history */}
      {historyTransfers.length > 0 && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-700 text-sm">היסטוריית העברות</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-start px-4 py-3 font-medium text-gray-600">תאריך</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">גוף כשרות</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">מ</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">אל</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">טווח</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">כמות</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">סטטוס</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {historyTransfers.map((t) => {
                const qty = t.rangeTo - t.rangeFrom + 1;
                const from = t.fromType === "ORG" ? "המשרד" : (t.fromMashgiach?.name ?? "?");
                const to = t.toType === "ORG" ? "המשרד" : (t.toMashgiach?.name ?? "?");
                return (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(t.sentAt)}</td>
                    <td className="px-4 py-3"><CertBodyTag name={t.batch.certBody?.name} /></td>
                    <td className="px-4 py-3 font-medium text-gray-800">{from}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{to}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {t.rangeFrom.toLocaleString()}–{t.rangeTo.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium">{qty.toLocaleString()}</td>
                    <td className="px-4 py-3">{statusBadge(t.status)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Usage history */}
      {batches.some((b) => b.allocations.some((a) => a.usages.length > 0)) && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-700 text-sm">היסטוריית שימוש</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-start px-4 py-3 font-medium text-gray-600">תאריך</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">גוף כשרות</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">טווח</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">כמות</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">פרויקט</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">לקוח</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">מפעל</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {batches.flatMap((b) =>
                b.allocations.flatMap((alloc) =>
                  alloc.usages.map((usage) => (
                    <tr key={usage.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(usage.usedAt)}</td>
                      <td className="px-4 py-3"><CertBodyTag name={b.certBody?.name} /></td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {usage.rangeFrom.toLocaleString()} – {usage.rangeTo.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {(usage.rangeTo - usage.rangeFrom + 1).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/projects/${alloc.project.id}`} className="text-blue-600 hover:underline text-xs">
                          פרויקט ←
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{alloc.project.client.name}</td>
                      <td className="px-4 py-3 text-gray-600">{alloc.project.site.name}</td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
