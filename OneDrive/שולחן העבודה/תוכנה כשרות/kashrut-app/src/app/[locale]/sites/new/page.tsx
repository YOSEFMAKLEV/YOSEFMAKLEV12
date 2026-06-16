import Link from "next/link";
import { NewSiteForm } from "@/components/sites/NewSiteForm";
import { getClients } from "@/actions/clients";

const ORG_ID = "org_demo";

export default async function NewSitePage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId } = await searchParams;
  const clients = await getClients(ORG_ID).catch(() => []);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/sites" className="hover:text-gray-700">אתרים</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">אתר חדש</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">הוספת אתר חדש</h1>
      <NewSiteForm clients={clients} defaultClientId={clientId} />
    </div>
  );
}
