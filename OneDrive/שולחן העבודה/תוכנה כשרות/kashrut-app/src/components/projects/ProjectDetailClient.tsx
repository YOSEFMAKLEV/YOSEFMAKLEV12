"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProjectStatus, updateProject } from "@/actions/projects";
import Link from "next/link";
import { ProjectBillingTab } from "./ProjectBillingTab";

type Assignment = {
  id: string; scheduledAt: Date; scheduledEnd: Date | null;
  type: string; status: string; mashgiach: { name: string };
};
type Certificate = { id: string; issuedAt: Date; expiresAt: Date; status: string; pdfUrl: string | null };
type Invoice = { id: string; number: string; total: number; status: string; dueDate: Date | null };
type Log = { id: string; description: string; createdAt: Date; user: { name: string } | null };
type PriceItem = { id: string; name: string; unitLabel: string | null; price: number; currency: string };
type LineItem = {
  id: string; description: string; quantity: number; unitPrice: number;
  currency: string; notes: string | null; priceItemId: string | null;
  priceItem: { id: string; name: string; unitLabel: string | null } | null;
};

type Project = {
  id: string; status: string; type: string;
  openedAt: Date;
  plannedVisitAt: Date | null;
  plannedVisitEnd: Date | null;
  actualVisitAt: Date | null;
  completedAt: Date | null;
  notes: string | null;
  assignments: Assignment[];
  certificates: Certificate[];
  invoices: Invoice[];
  activityLogs: Log[];
  priceItems: PriceItem[];
  lineItems: LineItem[];
};

const STATUS_NEXT: Record<string, string | null> = {
  PENDING: "ACTIVE", ACTIVE: "COMPLETED", COMPLETED: "APPROVED", APPROVED: "CERTIFIED", CERTIFIED: null,
};
const STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין", ACTIVE: "פעיל", COMPLETED: "הושלם", APPROVED: "מאושר", CERTIFIED: "תעודה הונפקה",
};
const ASSIGN_STATUS_LABELS: Record<string, string> = {
  CREATED: "נוצר", SITE_CONFIRMED: "אושר", DEPARTED: "יצא", ARRIVED: "הגיע",
  COMPLETED: "הסתיים", REPORTED: "דווח", APPROVED: "אושר",
};
const CERT_STATUS_LABELS: Record<string, string> = {
  ISSUED: "הונפקה", WAITING_PAYMENT: "ממתין תשלום", READY_TO_SEND: "מוכן לשחרור", SENT: "נשלחה", SENT_MANUALLY: "נשלחה ידנית",
};
const INV_STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין", PAID: "שולם", OVERDUE: "באיחור", PARTIAL: "שולם חלקית",
};

export function ProjectDetailClient({ project }: { project: Project }) {
  const router = useRouter();
  const [tab, setTab] = useState<"info" | "assignments" | "certificates" | "billing" | "invoices" | "activity">("info");
  const [advancing, setAdvancing] = useState(false);
  const [editingDate, setEditingDate] = useState<{ field: "plannedVisitAt" | "plannedVisitEnd"; draft: string } | null>(null);
  const [savingDate, setSavingDate] = useState(false);

  async function handleDateSave() {
    if (!editingDate || !editingDate.draft) return;
    setSavingDate(true);
    await updateProject(project.id, { [editingDate.field]: new Date(editingDate.draft) });
    setEditingDate(null);
    setSavingDate(false);
    router.refresh();
  }

  const nextStatus = STATUS_NEXT[project.status];

  async function advance() {
    if (!nextStatus) return;
    setAdvancing(true);
    await updateProjectStatus(project.id, nextStatus as never);
    router.refresh();
    setAdvancing(false);
  }

  const tabs = [
    { id: "info" as const, label: "פרטים" },
    { id: "assignments" as const, label: `שיבוצים (${project.assignments.length})` },
    { id: "certificates" as const, label: `תעודות (${project.certificates.length})` },
    { id: "billing" as const, label: `חיוב (${project.lineItems.length})` },
    { id: "invoices" as const, label: `חשבוניות (${project.invoices.length})` },
    { id: "activity" as const, label: "פעילות" },
  ];

  return (
    <div>
      {/* Advance status */}
      {nextStatus && (
        <div className="mb-6 rounded-xl border bg-white p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">קדם סטטוס:</p>
            <p className="text-xs text-gray-500">{STATUS_LABELS[project.status]} → {STATUS_LABELS[nextStatus]}</p>
          </div>
          <button onClick={advance} disabled={advancing}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {advancing ? "מעדכן..." : `קדם ל-${STATUS_LABELS[nextStatus]}`}
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        {tabs.map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Info tab */}
      {tab === "info" && (
        <div className="rounded-xl border bg-white p-5 space-y-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {/* Static rows */}
            {[
              { label: "נפתח", value: new Date(project.openedAt).toLocaleDateString("he-IL") },
              { label: "ביקור בפועל", value: project.actualVisitAt ? new Date(project.actualVisitAt).toLocaleDateString("he-IL") : "—" },
              { label: "הושלם", value: project.completedAt ? new Date(project.completedAt).toLocaleDateString("he-IL") : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-900">{value}</span>
              </div>
            ))}

            {/* Editable: מתאריך */}
            <div className="flex justify-between items-center py-1 border-b border-gray-50">
              <span className="text-gray-500">מתאריך</span>
              {editingDate?.field === "plannedVisitAt" ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    autoFocus
                    value={editingDate.draft}
                    disabled={savingDate}
                    onChange={(e) => setEditingDate({ ...editingDate, draft: e.target.value })}
                    onKeyDown={(e) => { if (e.key === "Escape") setEditingDate(null); if (e.key === "Enter" && editingDate.draft) handleDateSave(); }}
                    className="rounded border border-blue-300 px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button onClick={handleDateSave} disabled={!editingDate.draft || savingDate}
                    className="w-7 h-7 rounded-md flex items-center justify-center bg-blue-600 text-white disabled:opacity-30 hover:bg-blue-700 transition-colors" title="שמור">
                    <svg width="11" height="11" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <button onClick={() => setEditingDate(null)}
                    className="w-7 h-7 rounded-md flex items-center justify-center border border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors" title="ביטול">
                    <svg width="11" height="11" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingDate({ field: "plannedVisitAt", draft: project.plannedVisitAt ? new Date(project.plannedVisitAt).toISOString().slice(0, 10) : "" })}
                  title="לחץ לעריכה"
                  className="font-medium text-gray-900 hover:text-blue-600 hover:underline transition-colors flex items-center gap-1 group"
                >
                  {project.plannedVisitAt ? new Date(project.plannedVisitAt).toLocaleDateString("he-IL") : <span className="text-gray-400">— הוסף תאריך</span>}
                  <svg width="11" height="11" viewBox="0 0 15 15" fill="none" className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400">
                    <path d="M11.85 1.15a1 1 0 00-1.41 0L3.71 7.88l-.5 2.72 2.71-.5 6.75-6.75a1 1 0 000-1.2z" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Editable: עד תאריך */}
            <div className="flex justify-between items-center py-1 border-b border-gray-50">
              <span className="text-gray-500">עד תאריך</span>
              {editingDate?.field === "plannedVisitEnd" ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    autoFocus
                    value={editingDate.draft}
                    disabled={savingDate}
                    onChange={(e) => setEditingDate({ ...editingDate, draft: e.target.value })}
                    onKeyDown={(e) => { if (e.key === "Escape") setEditingDate(null); if (e.key === "Enter" && editingDate.draft) handleDateSave(); }}
                    className="rounded border border-blue-300 px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button onClick={handleDateSave} disabled={!editingDate.draft || savingDate}
                    className="w-7 h-7 rounded-md flex items-center justify-center bg-blue-600 text-white disabled:opacity-30 hover:bg-blue-700 transition-colors" title="שמור">
                    <svg width="11" height="11" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <button onClick={() => setEditingDate(null)}
                    className="w-7 h-7 rounded-md flex items-center justify-center border border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors" title="ביטול">
                    <svg width="11" height="11" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingDate({ field: "plannedVisitEnd", draft: project.plannedVisitEnd ? new Date(project.plannedVisitEnd).toISOString().slice(0, 10) : "" })}
                  title="לחץ לעריכה"
                  className="font-medium text-gray-900 hover:text-blue-600 hover:underline transition-colors flex items-center gap-1 group"
                >
                  {project.plannedVisitEnd ? new Date(project.plannedVisitEnd).toLocaleDateString("he-IL") : <span className="text-gray-400">— הוסף תאריך</span>}
                  <svg width="11" height="11" viewBox="0 0 15 15" fill="none" className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400">
                    <path d="M11.85 1.15a1 1 0 00-1.41 0L3.71 7.88l-.5 2.72 2.71-.5 6.75-6.75a1 1 0 000-1.2z" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {project.notes && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">הערות</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{project.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Assignments tab */}
      {tab === "assignments" && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-start px-4 py-3 font-medium text-gray-600">משגיח</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">תאריך</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">סוג</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">סטטוס</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {project.assignments.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">אין שיבוצים</td></tr>
              )}
              {project.assignments.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 font-medium">{a.mashgiach.name}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(a.scheduledAt).toLocaleDateString("he-IL")}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{a.type}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs">
                      {ASSIGN_STATUS_LABELS[a.status] ?? a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/scheduling/${a.id}`} className="text-xs text-blue-600 hover:underline">פתח</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Certificates tab */}
      {tab === "certificates" && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-start px-4 py-3 font-medium text-gray-600">הונפקה</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">תוקף עד</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">סטטוס</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {project.certificates.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">
                  אין תעודות — <Link href={`/certificates/new?projectId=${project.id}`} className="text-blue-600 hover:underline">הנפק</Link>
                </td></tr>
              )}
              {project.certificates.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 text-gray-500">{new Date(c.issuedAt).toLocaleDateString("he-IL")}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(c.expiresAt).toLocaleDateString("he-IL")}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs">
                      {CERT_STATUS_LABELS[c.status] ?? c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {c.pdfUrl && <a href={c.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">PDF</a>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Billing tab */}
      {tab === "billing" && (
        <ProjectBillingTab
          projectId={project.id}
          priceItems={project.priceItems}
          lineItems={project.lineItems}
        />
      )}

      {/* Invoices tab */}
      {tab === "invoices" && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-start px-4 py-3 font-medium text-gray-600">מספר</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">סכום</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">תאריך יעד</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">סטטוס</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {project.invoices.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">
                  אין חשבוניות — <Link href={`/finance/invoices/new?projectId=${project.id}`} className="text-blue-600 hover:underline">צור</Link>
                </td></tr>
              )}
              {project.invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-4 py-3 font-mono">{inv.number}</td>
                  <td className="px-4 py-3 font-medium">₪{inv.total.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("he-IL") : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${inv.status === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {INV_STATUS_LABELS[inv.status] ?? inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Activity tab */}
      {tab === "activity" && (
        <div className="rounded-xl border bg-white divide-y divide-gray-100">
          {project.activityLogs.length === 0 && (
            <p className="text-center py-8 text-gray-400">אין פעילות</p>
          )}
          {project.activityLogs.map((log) => (
            <div key={log.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900">{log.description}</p>
                {log.user && <p className="text-xs text-gray-400">{log.user.name}</p>}
              </div>
              <span className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleDateString("he-IL")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
