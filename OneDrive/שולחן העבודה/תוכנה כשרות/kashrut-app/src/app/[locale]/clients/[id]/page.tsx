import Link from "next/link";
import { notFound } from "next/navigation";
import { getClientById } from "@/actions/clients";
import { getDealers } from "@/actions/dealers";
import { ActivityDrawer } from "@/components/shared/ActivityDrawer";
import { ClientTabs } from "@/components/clients/ClientTabs";
import { PortalLinkButton } from "@/components/portal/PortalLinkButton";

const ORG_ID = "org_demo";

const typeLabels: Record<string, string> = {
  IMPORTER: "יבואן",
  BUSINESS: "בית עסק",
  BOTH: "יבואן + בית עסק",
};

const releaseLabels: Record<string, string> = {
  IMMEDIATE: "שחרור מיידי",
  AFTER_PAYMENT: "ממתין לתשלום",
};

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const [client, dealers] = await Promise.all([
    getClientById(id).catch(() => null),
    getDealers(ORG_ID).catch(() => []),
  ]);
  if (!client) notFound();

  return (
    <div className="flex gap-6">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/clients" className="hover:text-gray-700">לקוחות</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{client.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            {client.nameEn && (
              <p className="text-gray-500 text-sm mt-0.5">{client.nameEn}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                {typeLabels[client.type]}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  client.certRelease === "IMMEDIATE"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {releaseLabels[client.certRelease]}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PortalLinkButton type="client" id={id} existingToken={client.portalToken} />
            <Link
              href={`/clients/${id}/edit`}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              עריכה
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <ClientTabs client={client} orgId={ORG_ID} dealers={dealers.map(d => ({ id: d.id, name: d.name }))} />
      </div>

      {/* Activity sidebar */}
      <div className="w-72 shrink-0">
        <div className="rounded-xl border bg-white h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h3 className="font-semibold text-sm text-gray-700">פעילות</h3>
          </div>
          <ActivityDrawer
            logs={client.activityLogs}
            clientId={client.id}
            organizationId={ORG_ID}
          />
        </div>
      </div>
    </div>
  );
}
