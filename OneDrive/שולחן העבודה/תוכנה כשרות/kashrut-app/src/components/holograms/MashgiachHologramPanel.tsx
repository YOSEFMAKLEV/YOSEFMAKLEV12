import { getMashgiachTransfers, getMashgiachHologramBalance, getHologramBatches } from "@/actions/holograms";
import { prisma } from "@/lib/prisma";
import { ConfirmTransferButton, RejectTransferButton } from "./TransferActions";
import { SendTransferForm } from "./SendTransferForm";

const ORG_ID = "org_demo";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d));
}

export async function MashgiachHologramPanel({ mashgiachId }: { mashgiachId: string }) {
  const [transfers, balanceResult, batches, mashgichim] = await Promise.all([
    getMashgiachTransfers(mashgiachId).catch(() => []),
    getMashgiachHologramBalance(mashgiachId).catch(() => ({ total: 0, byCertBody: {} })),
    getHologramBatches(ORG_ID).catch(() => [] as Awaited<ReturnType<typeof getHologramBatches>>),
    prisma.mashgiach.findMany({
      where: { organizationId: ORG_ID, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }).catch(() => []),
  ]);

  const balance = balanceResult.total;
  const pending = transfers.filter((t) => t.status === "PENDING" && t.toMashgiachId === mashgiachId);
  const history = transfers.filter((t) => t.status !== "PENDING");

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-purple-50">
        <div>
          <h2 className="font-semibold text-gray-900">הולוגרמות שלי</h2>
          <p className="text-xs text-gray-500 mt-0.5">מלאי, העברות וקבלות</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Balance badge */}
          <div className={`rounded-full px-3 py-1 text-sm font-bold ${balance > 0 ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"}`}>
            {balance.toLocaleString()} מדבקות
          </div>
          {/* Transfer button — only if has holograms */}
          {balance > 0 && (
            <SendTransferForm
              orgId={ORG_ID}
              batches={batches.map((b) => ({ id: b.id, rangeFrom: b.rangeFrom, rangeTo: b.rangeTo, notes: b.notes, certBodyName: b.certBody?.name }))}
              mashgichim={mashgichim}
              senderMashgiachId={mashgiachId}
            />
          )}
        </div>
      </div>

      {/* Pending transfers — need confirmation */}
      {pending.length > 0 && (
        <div className="border-b">
          <div className="px-5 py-2 bg-amber-50 border-b border-amber-100">
            <p className="text-xs font-semibold text-amber-700">
              ממתינות לאישורך ({pending.length})
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {pending.map((t) => {
              const qty = t.rangeTo - t.rangeFrom + 1;
              const from = t.fromType === "ORG" ? "המשרד" : (t.fromMashgiach?.name ?? "?");
              return (
                <div key={t.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs">
                    {qty}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      {from} שלח אליך{" "}
                      <span className="font-bold">{qty.toLocaleString()}</span> הולוגרמות
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      מס׳ {t.rangeFrom.toLocaleString()}–{t.rangeTo.toLocaleString()} · {formatDate(t.sentAt)}
                      {t.notes && <span> · {t.notes}</span>}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <ConfirmTransferButton transferId={t.id} />
                    <RejectTransferButton transferId={t.id} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {balance === 0 && pending.length === 0 && history.length === 0 && (
        <div className="px-5 py-8 text-center text-gray-400 text-sm">
          אין הולוגרמות ברשותך כרגע
        </div>
      )}

      {/* History — last 5 */}
      {history.length > 0 && (
        <div className="divide-y divide-gray-100">
          {history.slice(0, 5).map((t) => {
            const qty = t.rangeTo - t.rangeFrom + 1;
            const isSent = t.fromMashgiachId === mashgiachId;
            const other = isSent
              ? (t.toType === "ORG" ? "המשרד" : (t.toMashgiach?.name ?? "?"))
              : (t.fromType === "ORG" ? "המשרד" : (t.fromMashgiach?.name ?? "?"));
            const statusColors: Record<string, string> = {
              CONFIRMED: "text-green-600",
              REJECTED: "text-red-500",
              CANCELLED: "text-gray-400",
            };
            return (
              <div key={t.id} className="flex items-center gap-3 px-5 py-2.5">
                <span className={`text-base ${isSent ? "text-red-400" : "text-green-500"}`}>
                  {isSent ? "↑" : "↓"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700">
                    {isSent ? `שלחת ל${other}` : `קיבלת מ${other}`}
                    {" "}<span className="font-semibold">{qty.toLocaleString()}</span>
                    <span className="text-gray-400 ms-1">
                      ({t.rangeFrom.toLocaleString()}–{t.rangeTo.toLocaleString()})
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(t.sentAt)}</p>
                </div>
                <span className={`text-xs font-medium ${statusColors[t.status] ?? "text-gray-400"}`}>
                  {t.status === "CONFIRMED" ? "אושר" : t.status === "REJECTED" ? "נדחה" : "בוטל"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
