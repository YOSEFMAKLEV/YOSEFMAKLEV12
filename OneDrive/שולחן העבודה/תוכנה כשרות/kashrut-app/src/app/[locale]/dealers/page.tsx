import { getDealers } from "@/actions/dealers";
import { DealersManager } from "@/components/dealers/DealersManager";

const ORG_ID = "org_demo";

export default async function DealersPage() {
  const dealers = await getDealers(ORG_ID).catch(() => []);
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">סוכני כשרות</h1>
      </div>
      <DealersManager dealers={dealers as any} organizationId={ORG_ID} />
    </div>
  );
}
