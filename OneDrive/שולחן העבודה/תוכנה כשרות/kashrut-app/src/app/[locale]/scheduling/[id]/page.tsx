import Link from "next/link";
import { notFound } from "next/navigation";
import { getAssignmentWithReport } from "@/actions/reports";
import { AssignmentReportForm } from "@/components/scheduling/AssignmentReportForm";

const STATUS_LABELS: Record<string, string> = {
  CREATED: "נוצר",
  SITE_CONFIRMED: "אושר ע\"י האתר",
  DEPARTED: "יצא לדרך",
  ARRIVED: "הגיע לאתר",
  COMPLETED: "הושלם",
  REPORTED: "דווח",
  APPROVED: "מאושר",
};

const STATUS_COLORS: Record<string, string> = {
  CREATED: "bg-gray-100 text-gray-600",
  SITE_CONFIRMED: "bg-purple-100 text-purple-700",
  DEPARTED: "bg-yellow-100 text-yellow-700",
  ARRIVED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  REPORTED: "bg-teal-100 text-teal-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
};

const TYPE_LABELS: Record<string, string> = {
  ANNUAL: "שנתי", SPECIFIC: "ספציפי", CONTINUOUS: "רציף", INITIAL: "ביקור ראשוני",
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("he-IL", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(d));
}

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assignment = await getAssignmentWithReport(id).catch(() => null);
  if (!assignment) notFound();

  const report = assignment.reports[0] ?? null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/scheduling" className="hover:text-gray-700">שיבוצים</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">פרטי שיבוץ</span>
      </div>

      {/* Header card */}
      <div className="rounded-xl border bg-white p-5 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{assignment.mashgiach.name}</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {assignment.site.name} · {assignment.site.country}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">{assignment.site.timezone}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[assignment.status] ?? "bg-gray-100 text-gray-600"}`}>
            {STATUS_LABELS[assignment.status] ?? assignment.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-400 text-xs">לקוח</p>
            <Link href={`/clients/${assignment.project.client.id}`} className="text-blue-600 hover:underline font-medium">
              {assignment.project.client.name}
            </Link>
          </div>
          <div>
            <p className="text-gray-400 text-xs">סוג ביקור</p>
            <p className="font-medium">{TYPE_LABELS[assignment.type] ?? assignment.type}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">תאריך</p>
            <p className="font-medium">{formatDate(assignment.scheduledAt)}</p>
          </div>
          {assignment.scheduledEnd && (
            <div>
              <p className="text-gray-400 text-xs">עד</p>
              <p className="font-medium">{formatDate(assignment.scheduledEnd)}</p>
            </div>
          )}
          {assignment.project.certBody && (
            <div>
              <p className="text-gray-400 text-xs">גוף כשרות</p>
              <p className="font-medium">{assignment.project.certBody.name}</p>
            </div>
          )}
          {assignment.instructions && (
            <div className="col-span-2">
              <p className="text-gray-400 text-xs">הנחיות</p>
              <p className="text-gray-700">{assignment.instructions}</p>
            </div>
          )}
          {assignment.travelDetails && (
            <div className="col-span-2">
              <p className="text-gray-400 text-xs">פרטי נסיעה</p>
              <p className="text-gray-700">{assignment.travelDetails}</p>
            </div>
          )}
        </div>
      </div>

      {/* Report form */}
      <AssignmentReportForm
        assignmentId={id}
        siteInternalReport={assignment.site.internalReport ?? true}
        siteRabbinateReport={assignment.site.rabbinateReport ?? false}
        existingReport={report ? {
          checkIn: report.checkIn,
          checkOut: report.checkOut,
          internalNotes: report.internalNotes,
          rabbinateNotes: report.rabbinateNotes,
          findings: report.findings,
          issues: report.issues,
          hologramFrom: report.hologramFrom,
          hologramTo: report.hologramTo,
          status: report.status,
        } : null}
      />
    </div>
  );
}
