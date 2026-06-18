import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getMashgiachTransfers, getMashgiachHologramBalance, getHologramBatches } from "@/actions/holograms";
import { ConfirmTransferButton, RejectTransferButton } from "@/components/holograms/TransferActions";
import { SendTransferForm } from "@/components/holograms/SendTransferForm";

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
    PENDING: "ממתין לאישורי",
    CONFIRMED: "אושר",
    REJECTED: "נדחה",
    CANCELLED: "בוטל",
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${map[status] ?? ""}`}>
      {label[status] ?? status}
    </span>
  );
}

export default async function MashgiachHologramsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const mashgiach = userId
    ? await prisma.mashgiach.findFirst({ where: { userId } })
    : null;

  if (!mashgiach) redirect("/my-assignments");

  const [transfers, balanceResult, batches, mashgichim] = await Promise.all([
    getMashgiachTransfers(mashgiach.id).catch(() => []),
    getMashgiachHologramBalance(mashgiach.id).catch(() => ({ total: 0, byCertBody: {} })),
    getHologramBatches(ORG_ID).catch(() => [] as Awaited<ReturnType<typeof getHologramBatches>>),
    prisma.mashgiach.findMany({
      where: { organizationId: ORG_ID, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }).catch(() => []),
  ]);

  const balance = balanceResult.total;
  const byCertBody = balanceResult.byCertBody;
  const pending = transfers.filter((t) => t.status === "PENDING" && t.toMashgiachId === mashgiach.id);
  const history = transfers.filter((t) => t.status !== "PENDING");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">הולוגרמות שלי</h1>
          <p className="text-sm text-gray-500 mt-0.5">{mashgiach.name}</p>
        </div>
        {balance > 0 && (
          <SendTransferForm
            orgId={ORG_ID}
            batches={batches.map((b) => ({ id: b.id, rangeFrom: b.rangeFrom, rangeTo: b.rangeTo, notes: b.notes, certBodyName: b.certBody?.name }))}
            mashgichim={mashgichim}
            senderMashgiachId={mashgiach.id}
          />
        )}
      </div>

      {/* Balance card */}
      <div className={`rounded-xl p-5 ${balance > 0 ? "bg-purple-50" : "bg-gray-50"}`}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-600">יתרת הולוגרמות ברשותי</p>
          <p className={`text-3xl font-bold ${balance > 0 ? "text-purple-700" : "text-gray-400"}`}>
            {balance.toLocaleString()} <span className="text-base font-normal">מדבקות</span>
          </p>
        </div>
        {Object.keys(byCertBody).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(byCertBody).map(([id, cb]) =>
              cb.balance > 0 && (
                <div key={id} className="inline-flex items-center gap-1.5 rounded-full bg-white border border-blue-200 shadow-sm px-3 py-1">
                  <span className="text-xs font-semibold text-blue-700">{cb.name}</span>
                  <span className="text-xs font-bold text-purple-600">{cb.balance.toLocaleString()}</span>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Pending incoming — need confirmation */}
      {pending.length > 0 && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <div className="px-5 py-3 border-b bg-amber-50">
            <h2 className="font-semibold text-amber-800 text-sm">
              ממתינות לאישורי ({pending.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {pending.map((t) => {
              const qty = t.rangeTo - t.rangeFrom + 1;
              const from = t.fromType === "ORG" ? "המשרד" : (t.fromMashgiach?.name ?? "?");
              return (
                <div key={t.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                    {qty}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-gray-800">
                        {from} שלח אליך {qty.toLocaleString()} הולוגרמות
                      </p>
                      {t.batch.certBody && (
                        <span className="inline-block rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-semibold text-blue-700">
                          {t.batch.certBody.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      מספרים {t.rangeFrom.toLocaleString()}–{t.rangeTo.toLocaleString()} · {formatDate(t.sentAt)}
                      {t.notes && ` · ${t.notes}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
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
      {balance === 0 && pending.length === 0 && (
        <div className="rounded-xl border bg-white p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">🔢</p>
          <p className="font-medium">אין הולוגרמות ברשותך</p>
          <p className="text-sm mt-1">המשרד ישלח אליך הולוגרמות ותצטרך לאשר קבלה</p>
        </div>
      )}

      {/* Transfer history */}
      {history.length > 0 && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-700 text-sm">היסטוריית העברות</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {history.map((t) => {
              const qty = t.rangeTo - t.rangeFrom + 1;
              const from = t.fromType === "ORG" ? "המשרד" : (t.fromMashgiach?.name ?? "?");
              const to = t.toType === "ORG" ? "המשרד" : (t.toMashgiach?.name ?? "?");
              const isMine = t.fromMashgiachId === mashgiach.id;
              return (
                <div key={t.id} className="flex items-center gap-4 px-5 py-3">
                  <div className={`flex-shrink-0 text-lg ${isMine ? "text-red-400" : "text-green-500"}`}>
                    {isMine ? "↑" : "↓"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-800">
                        {isMine ? `שלחת ל${to}` : `קיבלת מ${from}`}
                        <span className="ms-2 font-semibold">{qty.toLocaleString()}</span>
                        <span className="text-gray-400 ms-1 font-mono text-xs">
                          ({t.rangeFrom.toLocaleString()}–{t.rangeTo.toLocaleString()})
                        </span>
                      </p>
                      {t.batch.certBody && (
                        <span className="inline-block rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-semibold text-blue-700">
                          {t.batch.certBody.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(t.sentAt)}</p>
                  </div>
                  {statusBadge(t.status)}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
