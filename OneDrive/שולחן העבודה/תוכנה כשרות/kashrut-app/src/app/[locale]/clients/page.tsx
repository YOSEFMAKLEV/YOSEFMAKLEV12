import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getClients } from "@/actions/clients";

const ORG_ID = "org_demo"; // יוחלף עם auth אמיתי

const typeLabels: Record<string, string> = {
  IMPORTER: "יבואן",
  BUSINESS: "בית עסק",
  BOTH: "יבואן + עסק",
};

const releaseLabels: Record<string, { label: string; color: string }> = {
  IMMEDIATE: { label: "שחרור מיידי", color: "bg-green-100 text-green-700" },
  AFTER_PAYMENT: { label: "ממתין לתשלום", color: "bg-orange-100 text-orange-700" },
};

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const t = await getTranslations("clients");
  const { q } = await searchParams;
  const clients = await getClients(ORG_ID, q).catch(() => []);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <Link
          href="/clients/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + {t("new")}
        </Link>
      </div>

      {/* Search */}
      <div className="mb-4">
        <form>
          <input
            name="q"
            defaultValue={q}
            placeholder="חיפוש לקוח..."
            className="w-full max-w-sm rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-start px-4 py-3 font-medium text-gray-600">שם לקוח</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">סוג</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">מפעלים</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">פרויקטים</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">שחרור תעודה</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  אין לקוחות עדיין — <Link href="/clients/new" className="text-blue-600 hover:underline">הוסף את הראשון</Link>
                </td>
              </tr>
            )}
            {clients.map((client) => {
              const release = releaseLabels[client.certRelease];
              return (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{client.name}</p>
                      {client.nameEn && <p className="text-xs text-gray-400">{client.nameEn}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {typeLabels[client.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{client._count.sites}</td>
                  <td className="px-4 py-3 text-gray-600">{client._count.projects}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${release.color}`}>
                      {release.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/clients/${client.id}`}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      פתח
                    </Link>
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
