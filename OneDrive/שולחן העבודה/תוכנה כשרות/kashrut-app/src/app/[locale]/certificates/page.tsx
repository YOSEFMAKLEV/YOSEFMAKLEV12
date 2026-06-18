import Link from "next/link";
import { getCertificates, getExpiringCertificates } from "@/actions/certificates";
import { CertificateActions } from "@/components/certificates/CertificateActions";

const ORG_ID = "org_demo";

const STATUS_LABELS: Record<string, string> = {
  ISSUED: "הונפקה",
  WAITING_PAYMENT: "ממתינה לתשלום",
  READY_TO_SEND: "מוכנה לשליחה",
  SENT: "נשלחה",
  SENT_MANUALLY: "נשלחה ידנית",
};
const STATUS_COLORS: Record<string, string> = {
  ISSUED: "bg-gray-100 text-gray-600",
  WAITING_PAYMENT: "bg-orange-100 text-orange-700",
  READY_TO_SEND: "bg-blue-100 text-blue-700",
  SENT: "bg-green-100 text-green-700",
  SENT_MANUALLY: "bg-teal-100 text-teal-700",
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("he-IL").format(new Date(d));
}

function countryName(code: string | null | undefined): string {
  if (!code) return "—";
  try {
    return new Intl.DisplayNames(["he"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

function daysUntil(d: Date) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export default async function CertificatesPage() {
  const [certs, expiring] = await Promise.all([
    getCertificates(ORG_ID).catch(() => []),
    getExpiringCertificates(ORG_ID, 90).catch(() => []),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">תעודות כשרות</h1>
        <Link href="/certificates/new" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + הנפק תעודה
        </Link>
      </div>

      {/* Expiring alert */}
      {expiring.length > 0 && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 mb-6">
          <h2 className="font-semibold text-orange-900 mb-3">⚠ תעודות שעומדות לפוג (90 יום)</h2>
          <div className="space-y-2">
            {expiring.map((cert) => {
              const days = daysUntil(cert.expiresAt);
              return (
                <div key={cert.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-orange-900">{cert.client.name}</span>
                    <span className="text-orange-700 mx-2">·</span>
                    <span className="text-orange-700">{cert.project.site.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${days <= 30 ? "text-red-600" : "text-orange-600"}`}>
                      עוד {days} ימים ({formatDate(cert.expiresAt)})
                    </span>
                    <Link href={`/projects/new?clientId=${cert.client.id}`} className="text-xs text-blue-600 hover:underline">
                      פתח פרויקט חדש
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Certificates table */}
      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-start px-4 py-3 font-medium text-gray-600">לקוח</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">אתר</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">מדינה</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">גוף כשרות</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">הונפקה</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">תוקף עד</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">סטטוס</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {certs.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">
                  אין תעודות — <Link href="/certificates/new" className="text-blue-600 hover:underline">הנפק את הראשונה</Link>
                </td>
              </tr>
            )}
            {certs.map((cert) => {
              const days = daysUntil(cert.expiresAt);
              const isExpiringSoon = days <= 90 && days > 0;
              const isExpired = days <= 0;
              return (
                <tr key={cert.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/clients/${cert.client.id}`} className="text-blue-600 hover:underline font-medium">
                      {cert.client.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{cert.project.site.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{countryName(cert.project.site.country)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{cert.certBody?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{formatDate(cert.issuedAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${isExpired ? "text-red-600" : isExpiringSoon ? "text-orange-600" : "text-gray-600"}`}>
                      {isExpired ? "⚠ פג תוקף" : isExpiringSoon ? `⏰ ${days} ימים` : formatDate(cert.expiresAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[cert.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABELS[cert.status] ?? cert.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <CertificateActions
                      certId={cert.id}
                      status={cert.status}
                      pdfUrl={cert.pdfUrl}
                    />
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
