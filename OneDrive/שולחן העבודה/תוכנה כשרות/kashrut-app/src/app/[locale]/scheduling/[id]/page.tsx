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

        {/* Navigation buttons — below travel details */}
        {(assignment.site.address || (assignment.site.latitude && assignment.site.longitude)) && (
          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
            <a
              href={
                assignment.site.latitude && assignment.site.longitude
                  ? `https://waze.com/ul?ll=${assignment.site.latitude},${assignment.site.longitude}&navigate=yes`
                  : `https://waze.com/ul?q=${encodeURIComponent(assignment.site.address ?? assignment.site.name)}&navigate=yes`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-[#009cde] bg-[#e8f7fd] hover:bg-[#d0f0fc] py-3 text-sm font-semibold text-[#006b9f] transition-colors"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#009cde" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.54 7.23A9 9 0 1 0 4.54 18.1l-.1 2.15a1 1 0 0 0 1.37 1l2-.8A9 9 0 0 0 20.54 7.23zM9 13a1.5 1.5 0 1 1 1.5-1.5A1.5 1.5 0 0 1 9 13zm6 0a1.5 1.5 0 1 1 1.5-1.5A1.5 1.5 0 0 1 15 13z"/>
              </svg>
              נווט ב-Waze
            </a>
            <a
              href={
                assignment.site.latitude && assignment.site.longitude
                  ? `https://www.google.com/maps/search/?api=1&query=${assignment.site.latitude},${assignment.site.longitude}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(assignment.site.address ?? assignment.site.name)}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-[#ea4335] bg-[#fef2f2] hover:bg-[#fee2e2] py-3 text-sm font-semibold text-[#b91c1c] transition-colors"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#ea4335"/>
              </svg>
              Google Maps
            </a>
          </div>
        )}
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
