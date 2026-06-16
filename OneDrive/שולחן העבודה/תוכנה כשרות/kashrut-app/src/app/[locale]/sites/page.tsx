import Link from "next/link";
import { getSites } from "@/actions/sites";

const ORG_ID = "org_demo";

const siteTypeLabels: Record<string, string> = {
  FACTORY: "מפעל",
  RESTAURANT: "מסעדה",
  HOTEL: "מלון",
  BAKERY: "מאפייה",
  WAREHOUSE: "מחסן",
  OTHER: "אחר",
};

const siteTypeColors: Record<string, string> = {
  FACTORY: "bg-blue-50 text-blue-700",
  RESTAURANT: "bg-orange-50 text-orange-700",
  HOTEL: "bg-purple-50 text-purple-700",
  BAKERY: "bg-yellow-50 text-yellow-700",
  WAREHOUSE: "bg-gray-100 text-gray-600",
  OTHER: "bg-gray-100 text-gray-600",
};

export default async function SitesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const sites = await getSites(ORG_ID, q).catch(() => []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">מפעלים ואתרים</h1>
        <Link
          href="/sites/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + אתר חדש
        </Link>
      </div>

      <div className="mb-4">
        <form>
          <input
            name="q"
            defaultValue={q}
            placeholder="חיפוש לפי שם, ארץ..."
            className="w-full max-w-sm rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-start px-4 py-3 font-medium text-gray-600">שם אתר</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">לקוח</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">סוג</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">ארץ</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">מוצרים</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">פרויקטים</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sites.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400">
                  אין אתרים —{" "}
                  <Link href="/sites/new" className="text-blue-600 hover:underline">
                    הוסף את הראשון
                  </Link>
                </td>
              </tr>
            )}
            {sites.map((site) => (
              <tr key={site.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{site.name}</p>
                    {site.nameEn && <p className="text-xs text-gray-400">{site.nameEn}</p>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/clients/${site.client.id}`} className="text-blue-600 hover:underline text-sm">
                    {site.client.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${siteTypeColors[site.type] || "bg-gray-100 text-gray-600"}`}>
                    {siteTypeLabels[site.type] || site.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{site.country || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{site._count.products}</td>
                <td className="px-4 py-3 text-gray-600">{site._count.projects}</td>
                <td className="px-4 py-3">
                  <Link href={`/sites/${site.id}`} className="text-blue-600 hover:underline text-xs">
                    פתח
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
