import { getAssignments } from "@/actions/assignments";
import { SchedulingCalendar } from "@/components/scheduling/SchedulingCalendar";

const ORG_ID = "org_demo";

export default async function SchedulingPage() {
  // Load current month + next month for initial view
  const from = new Date();
  from.setDate(1);
  from.setMonth(from.getMonth() - 1);
  const to = new Date(from);
  to.setMonth(to.getMonth() + 3);

  const assignments = await getAssignments(ORG_ID, from, to).catch(() => []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">לוח שיבוצים</h1>
        <a
          href="/scheduling/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + שיבוץ חדש
        </a>
      </div>
      <SchedulingCalendar assignments={assignments} />
    </div>
  );
}
