import Link from "next/link";
import { getClients } from "@/actions/clients";
import { getSites } from "@/actions/sites";
import { getCertBodies } from "@/actions/settings";
import { NewProjectForm } from "@/components/projects/NewProjectForm";

const ORG_ID = "org_demo";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; siteId?: string }>;
}) {
  const { clientId, siteId } = await searchParams;
  const [clients, sites, certBodies] = await Promise.all([
    getClients(ORG_ID).catch(() => []),
    getSites(ORG_ID).catch(() => []),
    getCertBodies(ORG_ID).catch(() => []),
  ]);

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/projects" className="hover:text-gray-700">פרויקטים</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">פרויקט חדש</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">פרויקט חדש</h1>
      <NewProjectForm
        clients={clients}
        sites={sites}
        certBodies={certBodies}
        orgId={ORG_ID}
        defaultClientId={clientId}
        defaultSiteId={siteId}
      />
    </div>
  );
}
