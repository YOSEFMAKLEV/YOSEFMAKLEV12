import Link from "next/link";
import { getMashgichim } from "@/actions/mashgichim";

const ORG_ID = "org_demo";

const salaryLabels: Record<string, string> = {
  HOURLY: "שעתי",
  DAILY: "יומי",
  MONTHLY: "חודשי",
  COMBINED: "משולב",
};

export default async function MashgichimPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const mashgichim = await getMashgichim(ORG_ID, q).catch(() => []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">משגיחים</h1>
        <Link
          href="/mashgichim/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + משגיח חדש
        </Link>
      </div>

      <div className="mb-4">
        <form>
          <input
            name="q"
            defaultValue={q}
            placeholder="חיפוש לפי שם, טלפון..."
            className="w-full max-w-sm rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mashgichim.length === 0 && (
          <div className="col-span-3 rounded-xl border bg-white p-12 text-center text-gray-400">
            אין משגיחים —{" "}
            <Link href="/mashgichim/new" className="text-blue-600 hover:underline">
              הוסף את הראשון
            </Link>
          </div>
        )}
        {mashgichim.map((m) => (
          <Link
            key={m.id}
            href={`/mashgichim/${m.id}`}
            className="rounded-xl border bg-white p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">{m.name}</p>
                {m.nameEn && <p className="text-xs text-gray-400">{m.nameEn}</p>}
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  m.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}
              >
                {m.isActive ? "פעיל" : "לא פעיל"}
              </span>
            </div>

            <div className="mt-3 space-y-1.5 text-sm text-gray-600">
              {m.phone && <p>📞 {m.phone}</p>}
              {m.city && <p>📍 {m.city}</p>}
              {m.salaryModel && (
                <p>💰 {salaryLabels[m.salaryModel]}{m.salaryRate ? ` · ₪${m.salaryRate}` : ""}</p>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {m.citizenships.map((c) => (
                <span key={c} className="rounded-full bg-blue-50 text-blue-600 px-2 py-0.5 text-xs">
                  {c}
                </span>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {m.levels.map((l) => (
                <span
                  key={l.levelId}
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: l.level.color ? `${l.level.color}20` : "#f3f4f6", color: l.level.color ?? "#374151" }}
                >
                  {l.level.name}
                </span>
              ))}
            </div>

            <p className="mt-3 text-xs text-gray-400">{m._count.assignments} שיבוצים</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
