"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ProjectChecklistDialog } from "./ProjectChecklistDialog";
import { QuickAssignDialog } from "./QuickAssignDialog";
import { deleteAssignment } from "@/actions/assignments";
import { updateProject } from "@/actions/projects";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600 border-gray-200",
  ACTIVE: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  APPROVED: "bg-purple-50 text-purple-700 border-purple-200",
  CERTIFIED: "bg-teal-50 text-teal-700 border-teal-200",
};
const STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין", ACTIVE: "פעיל", COMPLETED: "הושלם", APPROVED: "מאושר", CERTIFIED: "תעודה הונפקה",
};
const TYPE_LABELS: Record<string, string> = {
  ANNUAL: "שנתי", LAB: "מעבדה", SPECIFIC: "ספציפי",
};
const TYPE_COLORS: Record<string, string> = {
  ANNUAL: "bg-indigo-50 text-indigo-600",
  LAB: "bg-orange-50 text-orange-600",
  SPECIFIC: "bg-sky-50 text-sky-600",
};

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-amber-100 text-amber-700",
  "bg-purple-100 text-purple-700",
  "bg-rose-100 text-rose-700",
];

type Assignment = {
  id: string;
  scheduledAt: Date;
  scheduledEnd: Date | null;
  mashgiach: { id: string; name: string };
};

function fmtNum(n: number) {
  return `P-${String(n).padStart(3, "0")}`;
}

function countryName(code: string | null | undefined): string {
  if (!code) return "—";
  try {
    return new Intl.DisplayNames(["he"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

type Project = {
  id: string;
  projectNumber: number;
  organizationId: string;
  type: string;
  status: string;
  openedAt: Date;
  plannedVisitAt: Date | null;
  plannedVisitEnd: Date | null;
  client: { id: string; name: string };
  site: { id: string; name: string; country: string };
  certBody: { id: string; name: string } | null;
  dealer: { id: string; name: string } | null;
  assignments: Assignment[];
  _count: { assignments: number; certificates: number };
};

type QuickAssignState = {
  projectId: string;
  siteId: string;
  organizationId: string;
  projectType: string;
  projectName: string;
  plannedVisitAt?: string;
  plannedVisitEnd?: string;
  existingAssignment?: {
    id: string;
    mashgiachId: string;
    dateFrom: string;
    timeFrom: string;
    dateTo: string;
    timeTo: string;
  };
};

type Props = {
  projects: Project[];
  initialStatus?: string;
};

function formatShort(d: Date) {
  return new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "numeric", year: "2-digit" }).format(new Date(d));
}

function avatarColor(idx: number) {
  return AVATAR_COLORS[idx % AVATAR_COLORS.length];
}

function assignmentToEdit(a: Assignment) {
  const dt = new Date(a.scheduledAt);
  const dtEnd = a.scheduledEnd ? new Date(a.scheduledEnd) : dt;
  return {
    id: a.id,
    mashgiachId: a.mashgiach.id,
    dateFrom: dt.toISOString().slice(0, 10),
    timeFrom: dt.toISOString().slice(11, 16),
    dateTo: dtEnd.toISOString().slice(0, 10),
    timeTo: dtEnd.toISOString().slice(11, 16),
  };
}

export function ProjectsList({ projects, initialStatus }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState(initialStatus ?? "");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [openChecklist, setOpenChecklist] = useState<{ id: string; name: string } | null>(null);
  const [openAssign, setOpenAssign] = useState<QuickAssignState | null>(null);
  const [editingDate, setEditingDate] = useState<{ projectId: string; field: "plannedVisitAt" | "plannedVisitEnd"; draft: string } | null>(null);
  const [savingDate, setSavingDate] = useState(false);
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState<number | "">("");
  const [filterYear, setFilterYear] = useState<number | "">("");
  const [typeFilter, setTypeFilter] = useState("");

  async function handleDateSave() {
    if (!editingDate || !editingDate.draft) return;
    setSavingDate(true);
    await updateProject(editingDate.projectId, { [editingDate.field]: new Date(editingDate.draft) });
    setEditingDate(null);
    setSavingDate(false);
    router.refresh();
  }

  function handleDelete(assignmentId: string) {
    startTransition(async () => {
      await deleteAssignment(assignmentId);
      router.refresh();
    });
  }

  const filtered = projects.filter((p) => {
    const matchStatus = !statusFilter || p.status === statusFilter;
    const matchType = !typeFilter || p.type === typeFilter;
    const matchSearch = !search || p.client.name.includes(search) || p.site.name.includes(search) || fmtNum(p.projectNumber).includes(search.toUpperCase());
    let matchDate = true;
    if (filterMonth !== "" && filterYear !== "") {
      // First day and last day of the selected month
      const selStart = new Date(filterYear, filterMonth - 1, 1);
      const selEnd = new Date(filterYear, filterMonth, 0, 23, 59, 59);
      const from = p.plannedVisitAt ? new Date(p.plannedVisitAt) : null;
      const to = p.plannedVisitEnd ? new Date(p.plannedVisitEnd) : from;
      if (from && to) {
        // Project overlaps with selected month
        matchDate = from <= selEnd && to >= selStart;
      } else if (from) {
        matchDate = from >= selStart && from <= selEnd;
      } else {
        matchDate = false;
      }
    }
    return matchStatus && matchType && matchSearch && matchDate;
  });

  const counts = Object.fromEntries(
    ["PENDING", "ACTIVE", "COMPLETED", "APPROVED", "CERTIFIED"].map((s) => [
      s,
      projects.filter((p) => p.status === s).length,
    ])
  );

  return (
    <>
      {/* Search + filter bar */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-44">
            <span className="absolute inset-y-0 start-3 flex items-center text-gray-400 pointer-events-none">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M6.5 1a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zm-7 5.5a7 7 0 1 1 12.469 4.348l3.469 3.468a.75.75 0 1 1-1.06 1.061l-3.47-3.468A7 7 0 0 1-.5 6.5z" fill="currentColor" />
              </svg>
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חיפוש לקוח / מפעל / מספר..."
              className="w-full rounded-lg border border-gray-200 bg-white ps-9 pe-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {[["", "הכל"], ["PENDING", "ממתין"], ["ACTIVE", "פעיל"], ["COMPLETED", "הושלם"], ["CERTIFIED", "תעודה"]].map(
              ([s, label]) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                    statusFilter === s
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {label} ({s ? counts[s] ?? 0 : projects.length})
                </button>
              )
            )}
          </div>

        </div>

        {/* Date + type filter row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 font-medium">סינון לפי תאריך:</span>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value === "" ? "" : Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">כל החודשים</option>
            {["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"].map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value === "" ? "" : Number(e.target.value))}
            className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">כל השנים</option>
            {Array.from({ length: 7 }, (_, i) => now.getFullYear() - 2 + i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <span className="text-xs text-gray-300">|</span>
          <span className="text-xs text-gray-500 font-medium">סוג:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">כל הסוגים</option>
            <option value="ANNUAL">שנתי</option>
            <option value="LAB">מעבדה</option>
            <option value="SPECIFIC">ספציפי</option>
          </select>
          {(filterMonth !== "" || filterYear !== "" || typeFilter !== "") && (
            <button
              onClick={() => { setFilterMonth(""); setFilterYear(""); setTypeFilter(""); }}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              נקה סינון
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-start px-5 py-3 font-medium text-gray-500 w-8">#</th>
              <th className="text-start px-5 py-3 font-medium text-gray-500 w-[22%]">לקוח / מפעל</th>
              <th className="text-start px-4 py-3 font-medium text-gray-500">מדינה</th>
              <th className="text-start px-4 py-3 font-medium text-gray-500">סוג</th>
              <th className="text-start px-4 py-3 font-medium text-gray-500">גוף כשרות</th>
              <th className="text-start px-4 py-3 font-medium text-gray-500">משגיח</th>
              <th className="text-start px-4 py-3 font-medium text-gray-500">מתאריך</th>
              <th className="text-start px-4 py-3 font-medium text-gray-500">עד תאריך</th>
              <th className="text-center px-4 py-3 font-medium text-gray-500">סטטוס</th>
              <th className="w-8 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center py-14 text-gray-400">
                  {search ? "אין תוצאות לחיפוש זה" : (
                    <>אין פרויקטים — <Link href="/projects/new" className="text-blue-600 hover:underline">הוסף את הראשון</Link></>
                  )}
                </td>
              </tr>
            )}
            {filtered.map((p) => {
              const newAssignState: QuickAssignState = {
                projectId: p.id,
                siteId: p.site.id,
                organizationId: p.organizationId,
                projectType: p.type,
                projectName: `${p.client.name} / ${p.site.name}`,
                plannedVisitAt: p.plannedVisitAt ? new Date(p.plannedVisitAt).toISOString().slice(0, 10) : undefined,
                plannedVisitEnd: p.plannedVisitEnd ? new Date(p.plannedVisitEnd).toISOString().slice(0, 10) : undefined,
              };
              const primary = p.assignments[0];
              const isExpanded = expandedId === p.id;

              return (
                <tr key={p.id} className="hover:bg-gray-50/70 transition-colors group align-top">
                  {/* Project number */}
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs font-bold text-blue-600 whitespace-nowrap">
                      {fmtNum(p.projectNumber)}
                    </span>
                  </td>
                  {/* Client + Site */}
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/clients/${p.client.id}`}
                      className="font-semibold text-gray-900 hover:text-blue-600 transition-colors leading-tight block"
                    >
                      {p.client.name}
                    </Link>
                    <span className="text-xs text-gray-500 leading-tight">{p.site.name}</span>
                    {p.dealer ? (
                      <span className="mt-0.5 inline-block rounded-full bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 text-[10px] font-medium leading-tight">
                        🤝 {p.dealer.name}
                      </span>
                    ) : (
                      <span className="mt-0.5 inline-block rounded-full bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 text-[10px] font-medium leading-tight">
                        ישיר
                      </span>
                    )}
                  </td>

                  {/* Country */}
                  <td className="px-4 py-3.5 text-xs text-gray-500">
                    {p.site.country ? countryName(p.site.country) : <span className="text-gray-300">—</span>}
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3.5">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${TYPE_COLORS[p.type] ?? "bg-gray-100 text-gray-600"}`}>
                      {TYPE_LABELS[p.type] ?? p.type}
                    </span>
                  </td>

                  {/* Cert body */}
                  <td className="px-4 py-3.5 text-gray-500 text-xs">
                    {p.certBody?.name ?? <span className="text-gray-300">—</span>}
                  </td>

                  {/* Mashgiach column */}
                  <td className="px-4 py-3">
                    {p.assignments.length === 0 ? (
                      <button
                        onClick={() => setOpenAssign(newAssignState)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5 hover:bg-blue-100 hover:border-blue-300 transition-colors"
                      >
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                          <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        שיבוץ משגיח
                      </button>
                    ) : (
                      <div>
                        {/* Trigger row — entire row is one button */}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : p.id)}
                          className="flex items-center gap-2 w-full text-right rounded-lg px-1.5 py-1 -mx-1.5 hover:bg-gray-50 transition-colors"
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${avatarColor(0)}`}>
                            {primary.mashgiach.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-800 truncate">{primary.mashgiach.name}</div>
                            {p.assignments.length > 1 && (
                              <div className="text-[11px] text-gray-400 leading-tight mt-0.5">
                                + {p.assignments.length - 1} משגיחים נוספים
                              </div>
                            )}
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all ${
                            isExpanded
                              ? "bg-blue-50 border-blue-300 text-blue-600"
                              : "border-gray-200 bg-gray-50 text-gray-400"
                          }`}>
                            <svg
                              width="9" height="9" viewBox="0 0 10 10" fill="none"
                              className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                            >
                              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </button>

                        {/* Expanded panel */}
                        {isExpanded && (
                          <div className="mt-2 rounded-xl border border-gray-200 bg-white overflow-hidden">
                            <div className="divide-y divide-gray-100">
                              {p.assignments.map((a, idx) => (
                                <div key={a.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold flex-shrink-0 ${avatarColor(idx)}`}>
                                    {a.mashgiach.name.charAt(0)}
                                  </div>
                                  <span className="flex-1 text-xs font-medium text-gray-800 truncate">{a.mashgiach.name}</span>
                                  <button
                                    onClick={() => setOpenAssign({ ...newAssignState, existingAssignment: assignmentToEdit(a) })}
                                    className="w-6 h-6 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors flex-shrink-0"
                                    title="ערוך שיבוץ"
                                  >
                                    <svg width="11" height="11" viewBox="0 0 15 15" fill="none"><path d="M11.8536 1.14645C11.6583 0.951184 11.3417 0.951184 11.1464 1.14645L3.71429 8.57857L3.21429 11.2857L5.92143 10.7857L13.3536 3.35355C13.5488 3.15829 13.5488 2.84171 13.3536 2.64645L11.8536 1.14645Z" stroke="currentColor" strokeWidth="1.2"/><path d="M1 13.5H14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                                  </button>
                                  <Link
                                    href={`/mashgichim/${a.mashgiach.id}`}
                                    className="w-6 h-6 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors flex-shrink-0"
                                    title="תיק משגיח"
                                  >
                                    <svg width="11" height="11" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M2 13c0-3.038 2.462-5.5 5.5-5.5S13 9.962 13 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                                  </Link>
                                  <button
                                    onClick={() => handleDelete(a.id)}
                                    disabled={isPending}
                                    className="w-6 h-6 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-colors flex-shrink-0 disabled:opacity-40"
                                    title="הסר שיבוץ"
                                  >
                                    <svg width="11" height="11" viewBox="0 0 15 15" fill="none"><path d="M5 1h5M1 3.5h13M6 6v5M9 6v5M2.5 3.5l.7 9.3A1 1 0 0 0 4.2 14h6.6a1 1 0 0 0 1-.7L12.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-100 bg-gray-50">
                              <button
                                onClick={() => { setOpenAssign(newAssignState); setExpandedId(null); }}
                                className="inline-flex items-center gap-1 text-xs text-blue-600 border border-dashed border-blue-300 rounded-full px-2.5 py-1 hover:bg-blue-50 transition-colors"
                              >
                                + שבץ משגיח נוסף
                              </button>
                              <Link
                                href={`/projects/${p.id}`}
                                className="inline-flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded-full px-2.5 py-1 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                              >
                                ערוך פרויקט
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* From date — click to edit */}
                  <td className="px-4 py-3.5 text-sm">
                    {editingDate?.projectId === p.id && editingDate.field === "plannedVisitAt" ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="date"
                          autoFocus
                          value={editingDate.draft}
                          onChange={(e) => setEditingDate({ ...editingDate, draft: e.target.value })}
                          onKeyDown={(e) => { if (e.key === "Escape") setEditingDate(null); if (e.key === "Enter" && editingDate.draft) handleDateSave(); }}
                          className="w-28 rounded border border-blue-300 px-1.5 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button
                          onClick={handleDateSave}
                          disabled={!editingDate.draft || savingDate}
                          className="w-6 h-6 rounded-md flex items-center justify-center bg-blue-600 text-white disabled:opacity-30 hover:bg-blue-700 transition-colors flex-shrink-0"
                          title="שמור"
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                        <button
                          onClick={() => setEditingDate(null)}
                          className="w-6 h-6 rounded-md flex items-center justify-center border border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors flex-shrink-0"
                          title="ביטול"
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingDate({ projectId: p.id, field: "plannedVisitAt", draft: p.plannedVisitAt ? new Date(p.plannedVisitAt).toISOString().slice(0, 10) : "" })}
                        className="text-gray-500 hover:text-blue-600 hover:underline transition-colors"
                        title="לחץ לעריכה"
                      >
                        {p.plannedVisitAt ? formatShort(p.plannedVisitAt) : <span className="text-gray-300">—</span>}
                      </button>
                    )}
                  </td>

                  {/* To date — click to edit */}
                  <td className="px-4 py-3.5 text-sm">
                    {editingDate?.projectId === p.id && editingDate.field === "plannedVisitEnd" ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="date"
                          autoFocus
                          value={editingDate.draft}
                          onChange={(e) => setEditingDate({ ...editingDate, draft: e.target.value })}
                          onKeyDown={(e) => { if (e.key === "Escape") setEditingDate(null); if (e.key === "Enter" && editingDate.draft) handleDateSave(); }}
                          className="w-28 rounded border border-blue-300 px-1.5 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button
                          onClick={handleDateSave}
                          disabled={!editingDate.draft || savingDate}
                          className="w-6 h-6 rounded-md flex items-center justify-center bg-blue-600 text-white disabled:opacity-30 hover:bg-blue-700 transition-colors flex-shrink-0"
                          title="שמור"
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                        <button
                          onClick={() => setEditingDate(null)}
                          className="w-6 h-6 rounded-md flex items-center justify-center border border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors flex-shrink-0"
                          title="ביטול"
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingDate({ projectId: p.id, field: "plannedVisitEnd", draft: p.plannedVisitEnd ? new Date(p.plannedVisitEnd).toISOString().slice(0, 10) : "" })}
                        className="text-gray-500 hover:text-blue-600 hover:underline transition-colors"
                        title="לחץ לעריכה"
                      >
                        {p.plannedVisitEnd ? formatShort(p.plannedVisitEnd) : <span className="text-gray-300">—</span>}
                      </button>
                    )}
                  </td>

                  {/* Status badge — clickable → checklist */}
                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() => setOpenChecklist({ id: p.id, name: `${p.client.name} / ${p.site.name}` })}
                      title="לחץ לצפייה ברשימת המשימות"
                      className={`inline-flex items-center rounded-xl border px-3 py-1.5 transition-all hover:shadow-sm hover:scale-105 cursor-pointer ${
                        STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      <span className="text-xs font-semibold whitespace-nowrap">
                        {STATUS_LABELS[p.status] ?? p.status}
                      </span>
                    </button>
                  </td>

                  {/* Open link */}
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/projects/${p.id}`}
                      className="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all text-xs font-medium"
                    >
                      פתח ›
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {openAssign && (
        <QuickAssignDialog
          {...openAssign}
          onClose={() => setOpenAssign(null)}
        />
      )}

      {openChecklist && (
        <ProjectChecklistDialog
          projectId={openChecklist.id}
          projectName={openChecklist.name}
          onClose={() => setOpenChecklist(null)}
        />
      )}
    </>
  );
}
