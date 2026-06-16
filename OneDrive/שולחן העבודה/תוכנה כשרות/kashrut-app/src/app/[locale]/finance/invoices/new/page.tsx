import Link from "next/link";
import { getClients } from "@/actions/clients";
import { getProjects } from "@/actions/projects";
import { NewInvoiceForm } from "@/components/finance/NewInvoiceForm";

const ORG_ID = "org_demo";

export default async function NewInvoicePage() {
  const [clients, projects] = await Promise.all([
    getClients(ORG_ID).catch(() => []),
    getProjects(ORG_ID).catch(() => []),
  ]);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/finance" className="hover:text-gray-700">כספים</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">חשבונית חדשה</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">יצירת חשבונית</h1>
      <NewInvoiceForm clients={clients} projects={projects} orgId={ORG_ID} />
    </div>
  );
}
