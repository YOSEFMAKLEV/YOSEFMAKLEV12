import Link from "next/link";
import { IssueCertificateForm } from "@/components/certificates/IssueCertificateForm";
import { getProjects } from "@/actions/projects";
import { getCertBodies } from "@/actions/settings";

const ORG_ID = "org_demo";

export default async function NewCertificatePage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  const { projectId } = await searchParams;
  const [projects, certBodies] = await Promise.all([
    getProjects(ORG_ID).catch(() => []),
    getCertBodies(ORG_ID).catch(() => []),
  ]);

  const readyProjects = projects.filter((p) =>
    ["ACTIVE", "COMPLETED", "APPROVED"].includes(p.status)
  );

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/certificates" className="hover:text-gray-700">תעודות</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">הנפקת תעודה</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">הנפקת תעודת כשרות</h1>
      <IssueCertificateForm
        projects={readyProjects}
        certBodies={certBodies}
        defaultProjectId={projectId}
      />
    </div>
  );
}
