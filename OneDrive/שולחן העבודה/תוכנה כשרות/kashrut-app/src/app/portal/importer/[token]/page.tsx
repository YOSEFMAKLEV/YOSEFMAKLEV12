import { notFound } from "next/navigation";
import { getImporterPortalData } from "@/actions/portal";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין", ACTIVE: "פעיל", COMPLETED: "הושלם",
  APPROVED: "מאושר", CERTIFIED: "תעודה הונפקה",
};
const CERT_STATUS_LABELS: Record<string, string> = {
  ISSUED: "הונפקה", WAITING_PAYMENT: "ממתין לתשלום",
  READY_TO_SEND: "מוכן לשליחה", SENT: "נשלחה", SENT_MANUALLY: "נשלחה ידנית",
};
const INVOICE_STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין", PAID: "שולם", OVERDUE: "באיחור", PARTIAL: "שולם חלקית",
};

export default async function ImporterPortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const client = await getImporterPortalData(token);
  if (!client) notFound();

  const activeCerts = client.certificates.filter((c) =>
    ["READY_TO_SEND", "SENT", "SENT_MANUALLY"].includes(c.status)
  );
  const openInvoices = client.invoices.filter((i) => i.status !== "PAID");
  const totalDebt = openInvoices.reduce((s, i) => s + i.total, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
        <p className="text-gray-500 text-sm mt-1">פורטל יבואן — מידע עדכני על פרויקטים, תעודות וחשבוניות</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-gray-500 mb-1">פרויקטים פעילים</p>
          <p className="text-2xl font-bold text-gray-900">{client.projects.filter(p => p.status === "ACTIVE").length}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-gray-500 mb-1">תעודות בתוקף</p>
          <p className="text-2xl font-bold text-gray-900">{activeCerts.length}</p>
        </div>
        <div className={`rounded-xl border p-4 ${totalDebt > 0 ? "bg-red-50 border-red-200" : "bg-white"}`}>
          <p className="text-xs text-gray-500 mb-1">חוב פתוח</p>
          <p className={`text-2xl font-bold ${totalDebt > 0 ? "text-red-600" : "text-gray-900"}`}>
            ₪{totalDebt.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Projects */}
      <section>
        <h2 className="font-semibold text-gray-900 mb-3">פרויקטים</h2>
        <div className="rounded-xl border bg-white overflow-hidden">
          {client.projects.length === 0 ? (
            <p className="text-center py-8 text-gray-400">אין פרויקטים</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">אתר</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">גוף מכשיר</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">נפתח</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">סטטוס</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {client.projects.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium">{p.site.name} <span className="text-gray-400 font-normal">({p.site.country})</span></td>
                    <td className="px-4 py-3 text-gray-600">{p.certBody?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(p.openedAt).toLocaleDateString("he-IL")}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs">
                        {STATUS_LABELS[p.status] ?? p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Certificates */}
      <section>
        <h2 className="font-semibold text-gray-900 mb-3">תעודות כשרות</h2>
        <div className="rounded-xl border bg-white overflow-hidden">
          {client.certificates.length === 0 ? (
            <p className="text-center py-8 text-gray-400">אין תעודות</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">אתר</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">גוף מכשיר</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">הונפקה</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">תוקף עד</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">סטטוס</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {client.certificates.map((c) => {
                  const expired = new Date(c.expiresAt) < new Date();
                  return (
                    <tr key={c.id}>
                      <td className="px-4 py-3 font-medium">{c.project?.site?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{c.certBody?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(c.issuedAt).toLocaleDateString("he-IL")}</td>
                      <td className={`px-4 py-3 ${expired ? "text-red-600 font-medium" : "text-gray-500"}`}>
                        {new Date(c.expiresAt).toLocaleDateString("he-IL")}
                        {expired && " (פג)"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs">
                          {CERT_STATUS_LABELS[c.status] ?? c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {c.pdfUrl && (
                          <a href={c.pdfUrl} target="_blank" rel="noopener noreferrer"
                            className="text-blue-600 text-xs hover:underline">הורד PDF</a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Invoices */}
      <section>
        <h2 className="font-semibold text-gray-900 mb-3">חשבוניות</h2>
        <div className="rounded-xl border bg-white overflow-hidden">
          {client.invoices.length === 0 ? (
            <p className="text-center py-8 text-gray-400">אין חשבוניות</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">מספר</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">אתר</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">סכום</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">תאריך</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">סטטוס</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {client.invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-4 py-3 font-mono">{inv.number}</td>
                    <td className="px-4 py-3 text-gray-600">{inv.project?.site?.name ?? "—"}</td>
                    <td className="px-4 py-3 font-medium">₪{inv.total.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("he-IL") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        inv.status === "PAID" ? "bg-green-100 text-green-700" :
                        inv.status === "OVERDUE" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {INVOICE_STATUS_LABELS[inv.status] ?? inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
