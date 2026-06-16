import Link from "next/link";
import { NewAssignmentForm } from "@/components/scheduling/NewAssignmentForm";
import { getMashgichim } from "@/actions/mashgichim";
import { getSites } from "@/actions/sites";
import { getProjects } from "@/actions/projects";

const ORG_ID = "org_demo";

export default async function NewAssignmentPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; mashgiachId?: string; projectId?: string }>;
}) {
  const { date, mashgiachId, projectId } = await searchParams;

  const [mashgichim, sites, projects] = await Promise.all([
    getMashgichim(ORG_ID).catch(() => []),
    getSites(ORG_ID).catch(() => []),
    getProjects(ORG_ID).catch(() => []),
  ]);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/scheduling" className="hover:text-gray-700">שיבוצים</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">שיבוץ חדש</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">שיבוץ משגיח חדש</h1>
      <NewAssignmentForm
        mashgichim={mashgichim}
        sites={sites}
        projects={projects}
        defaultDate={date}
        defaultMashgiachId={mashgiachId}
        defaultProjectId={projectId}
      />
    </div>
  );
}
