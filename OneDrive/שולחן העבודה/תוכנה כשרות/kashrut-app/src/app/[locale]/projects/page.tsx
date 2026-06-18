import Link from "next/link";
import { getProjects } from "@/actions/projects";
import { ProjectsList } from "@/components/projects/ProjectsList";

const ORG_ID = "org_demo";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const projects = await getProjects(ORG_ID).catch(() => []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">פרויקטים</h1>
        <Link
          href="/projects/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          + פרויקט חדש
        </Link>
      </div>

      <ProjectsList projects={projects as any} initialStatus={status} />
    </div>
  );
}
