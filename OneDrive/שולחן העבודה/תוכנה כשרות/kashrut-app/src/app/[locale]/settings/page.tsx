import { getCertBodies, getSupervisionLevels } from "@/actions/settings";
import { getActivityLogs } from "@/actions/activityLog";
import { SettingsPanel } from "@/components/settings/SettingsPanel";

const ORG_ID = "org_demo";

export default async function SettingsPage() {
  const [certBodies, levels, activityLogs] = await Promise.all([
    getCertBodies(ORG_ID).catch(() => []),
    getSupervisionLevels(ORG_ID).catch(() => []),
    getActivityLogs(ORG_ID, { limit: 200 }).catch(() => []),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">הגדרות מערכת</h1>
      <SettingsPanel
        certBodies={certBodies}
        levels={levels}
        orgId={ORG_ID}
        activityLogs={activityLogs as Parameters<typeof SettingsPanel>[0]["activityLogs"]}
      />
    </div>
  );
}
