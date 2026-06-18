import Link from "next/link";
import { getMashgichim } from "@/actions/mashgichim";
import { MashgichimList } from "@/components/mashgichim/MashgichimList";

const ORG_ID = "org_demo";

export default async function MashgichimPage() {
  const mashgichim = await getMashgichim(ORG_ID).catch(() => []);

  const data = mashgichim.map((m) => ({
    id: m.id,
    name: m.name,
    nameEn: m.nameEn,
    phone: m.phone,
    city: m.city,
    isActive: m.isActive,
    salaryModel: m.salaryModel,
    salaryRate: m.salaryRate,
    citizenships: m.citizenships,
    activeRegions: m.activeRegions,
    languages: (m.languages ?? {}) as Record<string, string>,
    levels: m.levels.map((l) => ({
      levelId: l.levelId,
      name: l.level.name,
      color: l.level.color,
    })),
    assignmentsCount: m._count.assignments,
  }));

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
      <MashgichimList mashgichim={data} />
    </div>
  );
}
