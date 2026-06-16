import Link from "next/link";
import { getProjects } from "@/actions/projects";

const ORG_ID = "org_demo";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  ACTIVE: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  APPROVED: "bg-purple-100 text-purple-700",
  CERTIFIED: "bg-teal-100 text-teal-700",
};
const STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין", ACTIVE: "פעיל", COMPLETED: "הושלם", APPROVED: "מאושר", CERTIFIED: "תעודה הונפקה",
};
const TYPE_LABELS: Record<string, string> = {
  ANNUAL: "שנתי", LAB: "מעבדה", SPECIFIC: "ספציפי",
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("he-IL").format(new Date(d));
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const projects = await getProjects(ORG_ID, q).catch(() => []);
  const filtered = status ? projects.filter((p) => p.status === status) : projects;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">פרויקטים</h1>
        <Link href="/projects/new" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + פרויקט חדש
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {["", "PENDING", "ACTIVE", "COMPLETED", "CERTIFIED"].map((s) => (
          <Link
            key={s}
            href={s ? `?status=${s}` : "/projects"}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              status === s || (!status && !s)
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
            }`}
          >
            {s ? STATUS_LABELS[s] : "הכל"} {!s ? `(${projects.length})` : `(${projects.filter((p) => p.status === s).length})`}
          </Link>
        ))}
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-start px-4 py-3 font-medium text-gray-600">לקוח</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">אתר</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">סוג</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">גוף כשרות</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">שיבוצים</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">נפתח</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">סטטוס</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">
                  אין פרויקטים — <Link href="/projects/new" className="text-blue-600 hover:underline">הוסף את הראשון</Link>
                </td>
              </tr>
            )}
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/clients/${p.client.id}`} className="text-blue-600 hover:underline font-medium">{p.client.name}</Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{p.site.name}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 text-xs">{TYPE_LABELS[p.type] ?? p.type}</span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{p.certBody?.name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{p._count.assignments}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(p.openedAt)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {STATUS_LABELS[p.status] ?? p.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/projects/${p.id}`} className="text-blue-600 hover:underline text-xs">פתח</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
