import { prisma } from "@/lib/prisma";
import { AlertsPanel } from "@/components/alerts/AlertsPanel";

const ORG_ID = "org_demo";

const ALERT_TYPE_LABELS: Record<string, string> = {
  CERT_EXPIRING: "תעודה פוקעת",
  CERT_NOT_SENT: "תעודה לא נשלחה",
  MASHGIACH_LATE: "משגיח באיחור",
  REPORT_NOT_SUBMITTED: "דיווח לא הוגש",
  PAYMENT_OVERDUE: "חוב באיחור",
  QUOTE_EXPIRING: "הצעת מחיר פוקעת",
  HOLOGRAM_LOW: "מלאי הולוגרמות נמוך",
  RAW_MATERIAL_EXPIRED: "חומר גלם פג תוקף",
};

export default async function AlertsPage() {
  const alerts = await prisma.alert.findMany({
    where: { organizationId: ORG_ID, isDismissed: false },
    orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
  }).catch(() => []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          התראות {alerts.length > 0 && <span className="ml-2 text-lg text-red-500">({alerts.length})</span>}
        </h1>
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <p className="text-4xl mb-4">✅</p>
          <p className="text-gray-500">אין התראות פעילות</p>
        </div>
      ) : (
        <AlertsPanel alerts={alerts} typeLabels={ALERT_TYPE_LABELS} />
      )}
    </div>
  );
}
