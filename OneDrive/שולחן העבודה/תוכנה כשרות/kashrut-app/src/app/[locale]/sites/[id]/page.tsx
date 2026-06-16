import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteById } from "@/actions/sites";
import { PortalLinkButton } from "@/components/portal/PortalLinkButton";

const siteTypeLabels: Record<string, string> = {
  FACTORY: "מפעל ייצור",
  RESTAURANT: "מסעדה",
  HOTEL: "מלון",
  BAKERY: "מאפייה",
  WAREHOUSE: "מחסן",
  OTHER: "אחר",
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
  SPECIFIC: "ספציפי",
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("he-IL").format(new Date(d));
}

export default async function SiteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = await getSiteById(id).catch(() => null);
  if (!site) notFound();

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/clients" className="hover:text-gray-700">לקוחות</Link>
        <span>/</span>
        <Link href={`/clients/${site.client.id}`} className="hover:text-gray-700">{site.client.name}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{site.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{site.name}</h1>
          {site.nameEn && <p className="text-gray-500 text-sm mt-0.5">{site.nameEn}</p>}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs font-medium">
              {siteTypeLabels[site.type] || site.type}
            </span>
            <span className="text-gray-400 text-sm">{site.country}</span>
            {site.address && <span className="text-gray-400 text-sm">· {site.address}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PortalLinkButton type="site" id={id} existingToken={site.accessToken} />
          <Link href={`/sites/${id}/edit`} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            עריכה
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: details + products */}
        <div className="col-span-2 space-y-6">

          {/* Details card */}
          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold text-gray-900 mb-4">פרטי האתר</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              {[
                { label: "איש קשר", value: site.contactName },
                { label: "טלפון", value: site.phone },
                { label: "אימייל", value: site.email },
                { label: "שפה", value: site.language },
                { label: "אזור זמן", value: site.timezone },
                { label: "דו\"ח פנימי", value: site.internalReport ? "כן" : "לא" },
                { label: "דו\"ח רבנות", value: site.rabbinateReport ? "כן" : "לא" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-gray-400 text-xs mb-0.5">{label}</p>
                  <p className="text-gray-900 font-medium">{value || "—"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Products */}
          <div className="rounded-xl border bg-white p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900">מוצרים ({site.products.length})</h2>
              <Link href={`/products/new?siteId=${site.id}&clientId=${site.clientId}`} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                + מוצר חדש
              </Link>
            </div>
            {site.products.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">אין מוצרים עדיין</p>
            ) : (
              <div className="space-y-2">
                {site.products.map((p) => (
                  <Link key={p.id} href={`/products/${p.id}`} className="flex justify-between items-center rounded-lg border px-4 py-2.5 hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{p.name}</p>
                      {p.category && <p className="text-xs text-gray-400">{p.category}</p>}
                    </div>
                    <span className="text-gray-300 text-sm">›</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Projects */}
          <div className="rounded-xl border bg-white p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900">פרויקטים ({site.projects.length})</h2>
              <Link href={`/projects/new?siteId=${site.id}&clientId=${site.clientId}`} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                + פרויקט חדש
              </Link>
            </div>
            {site.projects.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">אין פרויקטים עדיין</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-400 border-b">
                  <tr>
                    <th className="text-start pb-2">סוג</th>
                    <th className="text-start pb-2">סטטוס</th>
                    <th className="text-start pb-2">נפתח</th>
                    <th className="text-start pb-2">גוף כשרות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {site.projects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-gray-50">
                      <td className="py-2.5">
                        <Link href={`/projects/${proj.id}`} className="text-blue-600 hover:underline">
                          {projectTypeLabels[proj.type] || proj.type}
                        </Link>
                      </td>
                      <td className="py-2.5">
                        <span className="rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 text-xs">
                          {projectStatusLabels[proj.status] || proj.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-400 text-xs">{formatDate(proj.openedAt)}</td>
                      <td className="py-2.5 text-gray-600 text-xs">{proj.certBody?.name || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: activity */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold text-gray-900 mb-3">פעילות אחרונה</h2>
            <div className="space-y-3">
              {site.activityLogs.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">אין פעילות</p>
              )}
              {site.activityLogs.map((log) => (
                <div key={log.id} className="text-sm border-b pb-3 last:border-0">
                  <p className="text-gray-800">{log.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Intl.DateTimeFormat("he-IL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(log.createdAt))}
                    {log.user && ` · ${log.user.name}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
