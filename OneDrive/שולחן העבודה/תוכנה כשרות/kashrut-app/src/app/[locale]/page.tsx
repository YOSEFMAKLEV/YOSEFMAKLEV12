import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getExpiringCertificates } from "@/actions/certificates";
import { getFinanceSummary } from "@/actions/finance";

const ORG_ID = "org_demo";

async function getDashboardStats() {
  const now = new Date();
  const [
    activeProjects,
    activeAssignments,
    expiringCerts,
    financeSummary,
    recentActivity,
    upcomingAssignments,
  ] = await Promise.all([
    prisma.project.count({ where: { organizationId: ORG_ID, status: "ACTIVE" } }),
    prisma.assignment.count({
      where: { organizationId: ORG_ID, status: { in: ["ARRIVED", "DEPARTED", "SITE_CONFIRMED"] } },
    }),
    getExpiringCertificates(ORG_ID, 30),
    getFinanceSummary(ORG_ID),
    prisma.activityLog.findMany({
      where: { organizationId: ORG_ID },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { name: true } } },
    }),
    prisma.assignment.findMany({
      where: { organizationId: ORG_ID, scheduledAt: { gte: now }, status: { notIn: ["APPROVED"] } },
      orderBy: { scheduledAt: "asc" },
      take: 5,
      include: {
        mashgiach: { select: { name: true } },
        site: { select: { name: true, country: true } },
      },
    }),
  ]);

  return { activeProjects, activeAssignments, expiringCerts, financeSummary, recentActivity, upcomingAssignments };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats().catch(() => null);

  const statCards = [
    {
      label: "פרויקטים פעילים",
      value: stats?.activeProjects ?? "—",
      color: "bg-blue-50 text-blue-700",
      href: "/projects",
    },
    {
      label: "משגיחים בשטח",
      value: stats?.activeAssignments ?? "—",
      color: "bg-green-50 text-green-700",
      href: "/scheduling",
    },
    {
      label: "תעודות פוקעות (30 יום)",
      value: stats?.expiringCerts?.length ?? "—",
      color: "bg-yellow-50 text-yellow-700",
      href: "/certificates",
    },
    {
      label: "חובות פתוחים",
      value: stats?.financeSummary ? `₪${stats.financeSummary.totalReceivable.toLocaleString()}` : "—",
      color: stats?.financeSummary?.overdue ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-700",
      href: "/finance",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">לוח בקרה</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className={`rounded-xl p-5 ${card.color} hover:opacity-90 transition-opacity block`}>
            <p className="text-sm font-medium opacity-75">{card.label}</p>
            <p className="text-3xl font-bold mt-1">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Upcoming assignments */}
        <div className="col-span-2 rounded-xl border bg-white overflow-hidden">
          <div className="px-5 py-4 border-b bg-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">שיבוצים קרובים</h2>
            <Link href="/scheduling" className="text-xs text-blue-600 hover:underline">כל השיבוצים</Link>
          </div>
          {stats?.upcomingAssignments.length === 0 ? (
            <p className="text-center py-8 text-gray-400">אין שיבוצים קרובים</p>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                {stats?.upcomingAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{a.mashgiach.name}</p>
                      <p className="text-xs text-gray-500">{a.site.name} · {a.site.country}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-end text-xs">
                      {new Date(a.scheduledAt).toLocaleDateString("he-IL")}{" "}
                      {new Date(a.scheduledAt).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Quick actions + expiring certs */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold text-gray-900 mb-3">פעולות מהירות</h2>
            <div className="space-y-2">
              {[
                { label: "לקוח חדש", href: "/clients/new" },
                { label: "שיבוץ חדש", href: "/scheduling/new" },
                { label: "חשבונית חדשה", href: "/finance/invoices/new" },
                { label: "הנפק תעודה", href: "/certificates/new" },
              ].map((a) => (
                <Link key={a.href} href={a.href}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors">
                  <span className="text-gray-400">+</span> {a.label}
                </Link>
              ))}
            </div>
          </div>

          {stats?.expiringCerts && stats.expiringCerts.length > 0 && (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
              <h2 className="font-semibold text-yellow-900 mb-3">⚠ תעודות פוקעות</h2>
              <div className="space-y-2">
                {stats.expiringCerts.slice(0, 4).map((cert) => (
                  <div key={cert.id} className="text-xs text-yellow-800">
                    <p className="font-medium">{cert.client?.name ?? "—"}</p>
                    <p className="opacity-75">{new Date(cert.expiresAt).toLocaleDateString("he-IL")}</p>
                  </div>
                ))}
              </div>
              {stats.expiringCerts.length > 4 && (
                <Link href="/certificates" className="text-xs text-yellow-700 hover:underline mt-2 block">
                  + {stats.expiringCerts.length - 4} עוד
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent activity */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <div className="rounded-xl border bg-white overflow-hidden mt-6">
          <div className="px-5 py-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-900">פעילות אחרונה</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.recentActivity.map((log) => (
              <div key={log.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900">{log.description}</p>
                  {log.user && <p className="text-xs text-gray-400">{log.user.name}</p>}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleDateString("he-IL")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
