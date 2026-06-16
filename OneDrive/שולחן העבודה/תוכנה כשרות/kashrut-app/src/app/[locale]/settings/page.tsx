import { getCertBodies, getSupervisionLevels } from "@/actions/settings";
import { SettingsPanel } from "@/components/settings/SettingsPanel";

const ORG_ID = "org_demo";

export default async function SettingsPage() {
  const [certBodies, levels] = await Promise.all([
    getCertBodies(ORG_ID).catch(() => []),
    getSupervisionLevels(ORG_ID).catch(() => []),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">הגדרות מערכת</h1>
      <SettingsPanel certBodies={certBodies} levels={levels} orgId={ORG_ID} />
    </div>
  );
}
