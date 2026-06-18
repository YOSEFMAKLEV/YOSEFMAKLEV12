import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectById } from "@/actions/projects";
import { ProjectDetailClient } from "@/components/projects/ProjectDetailClient";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין", ACTIVE: "פעיל", COMPLETED: "הושלם", APPROVED: "מאושר", CERTIFIED: "תעודה הונפקה",
};
const TYPE_LABELS: Record<string, string> = { ANNUAL: "שנתי", LAB: "מעבדה", SPECIFIC: "ספציפי" };
const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600", ACTIVE: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700", APPROVED: "bg-purple-100 text-purple-700",
  CERTIFIED: "bg-teal-100 text-teal-700",
};

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectById(id).catch(() => null);
  if (!project) notFound();

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/projects" className="hover:text-gray-700">פרויקטים</Link>
        <span>/</span>
        <Link href={`/clients/${project.client.id}`} className="hover:text-gray-700">{project.client.name}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{project.site.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1">
              P-{String(project.projectNumber).padStart(3, "0")}
            </span>
            <h1 className="text-2xl font-bold text-gray-900">
              {project.site.name} — {TYPE_LABELS[project.type] ?? project.type}
            </h1>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">{project.client.name} · {project.site.country}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[project.status]}`}>
              {STATUS_LABELS[project.status]}
            </span>
            {project.certBody && (
              <span className="rounded-full bg-gray-100 text-gray-600 px-2.5 py-0.5 text-xs">{project.certBody.name}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/certificates/new?projectId=${id}`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            הנפק תעודה
          </Link>
          <Link href={`/scheduling/new?projectId=${id}`}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            + שיבוץ
          </Link>
        </div>
      </div>

      <ProjectDetailClient project={{
        id: project.id,
        status: project.status,
        type: project.type,
        openedAt: project.openedAt,
        plannedVisitAt: project.plannedVisitAt,
        plannedVisitEnd: project.plannedVisitEnd,
        actualVisitAt: project.actualVisitAt,
        completedAt: project.completedAt,
        notes: project.notes,
        assignments: project.assignments.map((a) => ({
          id: a.id, scheduledAt: a.scheduledAt, scheduledEnd: a.scheduledEnd,
          type: a.type, status: a.status, mashgiach: { name: a.mashgiach.name },
        })),
        certificates: project.certificates.map((c) => ({
          id: c.id, issuedAt: c.issuedAt, expiresAt: c.expiresAt, status: c.status, pdfUrl: c.pdfUrl,
        })),
        invoices: project.invoices.map((inv) => ({
          id: inv.id, number: inv.number, total: inv.total, status: inv.status, dueDate: inv.dueDate,
        })),
        activityLogs: project.activityLogs.map((l) => ({
          id: l.id, description: l.description, createdAt: l.createdAt, user: l.user,
        })),
        priceItems: project.client.priceItems.map((pi) => ({
          id: pi.id, name: pi.name, unitLabel: pi.unitLabel, price: pi.price, currency: pi.currency,
        })),
        lineItems: project.lineItems.map((li) => ({
          id: li.id, description: li.description, quantity: li.quantity, unitPrice: li.unitPrice,
          currency: li.currency, notes: li.notes, priceItemId: li.priceItemId,
          priceItem: li.priceItem,
        })),
      }} />
    </div>
  );
}
