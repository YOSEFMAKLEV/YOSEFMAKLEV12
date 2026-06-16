"use client";

import { useState } from "react";
import Link from "next/link";

type Client = {
  id: string;
  name: string;
  nameEn: string | null;
  type: string;
  vatNumber: string | null;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  certRelease: string;
  requiresQuote: boolean;
  sites: Array<{
    id: string;
    name: string;
    type: string;
    address: string | null;
    _count: { projects: number };
  }>;
  projects: Array<{
    id: string;
    status: string;
    type: string;
    notes: string | null;
    createdAt: Date;
    site: { name: string } | null;
    certBody: { name: string } | null;
  }>;
  certificates: Array<{
    id: string;
    issuedAt: Date;
    expiresAt: Date;
    status: string;
    pdfUrl: string | null;
  }>;
  invoices: Array<{
    id: string;
    number: string;
    total: number;
    status: string;
    dueDate: Date | null;
    createdAt: Date;
  }>;
};

const tabs = [
  { id: "details", label: "פרטים" },
  { id: "sites", label: "מפעלים / אתרים" },
  { id: "projects", label: "פרויקטים" },
  { id: "certificates", label: "תעודות" },
  { id: "finance", label: "כספים" },
];

const siteTypeLabels: Record<string, string> = {
  FACTORY: "מפעל",
  RESTAURANT: "מסעדה",
  HOTEL: "מלון",
  BAKERY: "מאפייה",
  WAREHOUSE: "מחסן",
  OTHER: "אחר",
};

const projectStatusColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  ACTIVE: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  APPROVED: "bg-purple-100 text-purple-700",
  CERTIFICATE_ISSUED: "bg-teal-100 text-teal-700",
};

const projectStatusLabels: Record<string, string> = {
  PENDING: "ממתין",
  ACTIVE: "פעיל",
  COMPLETED: "הושלם",
  APPROVED: "מאושר",
  CERTIFIED: "תעודה הונפקה",
};

const projectTypeLabels: Record<string, string> = {
  ANNUAL: "שנתי",
  LAB: "מעבדה",
  SPECIFIC: "ייצור ספציפי",
};

const certStatusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  EXPIRED: "bg-red-100 text-red-700",
  REVOKED: "bg-gray-100 text-gray-600",
};

const invoiceStatusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SENT: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
  OVERDUE: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-400",
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("he-IL").format(new Date(d));
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" }).format(n);
}

export function ClientTabs({ client, orgId }: { client: Client; orgId: string }) {
  const [active, setActive] = useState("details");

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              active === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Details */}
      {active === "details" && (
        <div className="rounded-xl border bg-white p-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            {[
              { label: "ח.פ / ע.מ", value: client.vatNumber },
              { label: "איש קשר", value: client.contactName },
              { label: "טלפון", value: client.phone },
              { label: "אימייל", value: client.email },
              { label: "כתובת", value: client.address },
              { label: "מצריך הצעת מחיר", value: client.requiresQuote ? "כן" : "לא" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-gray-400 text-xs mb-0.5">{label}</p>
                <p className="text-gray-900 font-medium">{value || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sites */}
      {active === "sites" && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-gray-500">{client.sites.length} אתרים</p>
            <Link
              href={`/sites/new?clientId=${client.id}`}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              + הוסף אתר
            </Link>
          </div>
          <div className="space-y-3">
            {client.sites.length === 0 && (
              <div className="rounded-xl border bg-white p-8 text-center text-gray-400">
                אין אתרים עדיין
              </div>
            )}
            {client.sites.map((site) => (
              <Link
                key={site.id}
                href={`/sites/${site.id}`}
                className="flex items-center justify-between rounded-xl border bg-white p-4 hover:shadow-sm transition-shadow"
              >
                <div>
                  <p className="font-medium text-gray-900">{site.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{site.address || "—"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {siteTypeLabels[site.type] || site.type}
                  </span>
                  <span className="text-xs text-gray-400">{site._count.projects} פרויקטים</span>
                  <span className="text-gray-300">›</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {active === "projects" && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-gray-500">{client.projects.length} פרויקטים אחרונים</p>
            <Link
              href={`/projects/new?clientId=${client.id}`}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              + פרויקט חדש
            </Link>
          </div>
          <div className="rounded-xl border bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-start px-4 py-2 font-medium text-gray-500">סוג פרויקט</th>
                  <th className="text-start px-4 py-2 font-medium text-gray-500">אתר</th>
                  <th className="text-start px-4 py-2 font-medium text-gray-500">גוף כשרות</th>
                  <th className="text-start px-4 py-2 font-medium text-gray-500">סטטוס</th>
                  <th className="text-start px-4 py-2 font-medium text-gray-500">תאריך</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {client.projects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      אין פרויקטים עדיין
                    </td>
                  </tr>
                )}
                {client.projects.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      <Link href={`/projects/${p.id}`} className="text-blue-600 hover:underline font-medium">
                        {projectTypeLabels[p.type] || p.type}
                        {p.notes && <span className="text-gray-400 text-xs ms-1">· {p.notes}</span>}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{p.site?.name || "—"}</td>
                    <td className="px-4 py-2.5 text-gray-600">{p.certBody?.name || "—"}</td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${projectStatusColors[p.status] || "bg-gray-100 text-gray-600"}`}>
                        {projectStatusLabels[p.status] || p.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-400 text-xs">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Certificates */}
      {active === "certificates" && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-start px-4 py-2 font-medium text-gray-500">הונפקה</th>
                <th className="text-start px-4 py-2 font-medium text-gray-500">תוקף עד</th>
                <th className="text-start px-4 py-2 font-medium text-gray-500">סטטוס</th>
                <th className="text-start px-4 py-2 font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {client.certificates.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    אין תעודות עדיין
                  </td>
                </tr>
              )}
              {client.certificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-gray-600">{formatDate(cert.issuedAt)}</td>
                  <td className="px-4 py-2.5 text-gray-600">{formatDate(cert.expiresAt)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${certStatusColors[cert.status] || "bg-gray-100 text-gray-600"}`}>
                      {cert.status === "ISSUED" ? "הונפקה" : cert.status === "EXPIRED" ? "פג תוקף" : cert.status === "REVOKED" ? "בוטלה" : cert.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 flex gap-2">
                    <Link href={`/certificates/${cert.id}`} className="text-xs text-blue-600 hover:underline">
                      צפה
                    </Link>
                    {cert.pdfUrl && (
                      <a href={cert.pdfUrl} target="_blank" rel="noreferrer" className="text-xs text-green-600 hover:underline">
                        PDF
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Finance */}
      {active === "finance" && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-gray-500">{client.invoices.length} חשבוניות אחרונות</p>
            <Link
              href={`/finance/invoices/new?clientId=${client.id}`}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              + חשבונית חדשה
            </Link>
          </div>
          <div className="rounded-xl border bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-start px-4 py-2 font-medium text-gray-500">מספר</th>
                  <th className="text-start px-4 py-2 font-medium text-gray-500">סכום</th>
                  <th className="text-start px-4 py-2 font-medium text-gray-500">תאריך</th>
                  <th className="text-start px-4 py-2 font-medium text-gray-500">לתשלום עד</th>
                  <th className="text-start px-4 py-2 font-medium text-gray-500">סטטוס</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {client.invoices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      אין חשבוניות עדיין
                    </td>
                  </tr>
                )}
                {client.invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-mono">{inv.number}</td>
                    <td className="px-4 py-2.5 font-medium">{formatCurrency(inv.total)}</td>
                    <td className="px-4 py-2.5 text-gray-600">{formatDate(inv.createdAt)}</td>
                    <td className="px-4 py-2.5 text-gray-600">{inv.dueDate ? formatDate(inv.dueDate) : "—"}</td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${invoiceStatusColors[inv.status] || "bg-gray-100 text-gray-600"}`}>
                        {inv.status === "PAID" ? "שולם" : inv.status === "SENT" ? "נשלח" : inv.status === "OVERDUE" ? "באיחור" : inv.status === "DRAFT" ? "טיוטה" : inv.status}
                      </span>
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
