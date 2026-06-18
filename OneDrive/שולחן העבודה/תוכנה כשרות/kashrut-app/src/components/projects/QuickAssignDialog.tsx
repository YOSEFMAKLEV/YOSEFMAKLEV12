"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getMashgichimForAssign } from "@/actions/mashgichim";
import { createAssignment, updateAssignment, deleteAssignment } from "@/actions/assignments";

type MashgiachForAssign = {
  id: string;
  name: string;
  city: string | null;
  assignments: {
    scheduledAt: Date;
    scheduledEnd: Date | null;
    site: { name: string };
  }[];
};

type Slot = {
  key: string;
  assignmentId?: string;
  mashgiachId: string;
  dateFrom: string;
  timeFrom: string;
  dateTo: string;
  timeTo: string;
  pickerOpen: boolean;
  pickerSearch: string;
  error: string;
  conflictWarning: string;
  forceOverride: boolean;
};

type Props = {
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
  onClose: () => void;
};

const VISIT_TYPE_MAP: Record<string, "ANNUAL" | "SPECIFIC" | "INITIAL"> = {
  ANNUAL: "ANNUAL",
  SPECIFIC: "SPECIFIC",
  LAB: "SPECIFIC",
};

const AVAIL = {
  free:    { dot: "#639922", text: "#3B6D11", label: "פנוי" },
  partial: { dot: "#EF9F27", text: "#854F0B", label: "עסוק חלקית" },
  busy:    { dot: "#E24B4A", text: "#A32D2D", label: "עסוק" },
} as const;

function todayPlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function makeSlot(dateFrom?: string, dateTo?: string): Slot {
  const from = dateFrom || todayPlus(1);
  const to = dateTo && dateTo >= from ? dateTo : from;
  return {
    key: Math.random().toString(36).slice(2),
    mashgiachId: "",
    dateFrom: from,
    timeFrom: "08:00",
    dateTo: to,
    timeTo: "18:00",
    pickerOpen: true,
    pickerSearch: "",
    error: "",
    conflictWarning: "",
    forceOverride: false,
  };
}

function getAvail(
  m: MashgiachForAssign,
  dateFrom: string,
  dateTo: string
): "free" | "partial" | "busy" {
  if (!dateFrom) return "free";
  const from = new Date(dateFrom + "T00:00:00");
  const to   = new Date((dateTo || dateFrom) + "T23:59:59");
  const count = m.assignments.filter((a) => {
    const s = new Date(a.scheduledAt);
    const e = a.scheduledEnd ? new Date(a.scheduledEnd) : s;
    return s <= to && e >= from;
  }).length;
  return count === 0 ? "free" : count === 1 ? "partial" : "busy";
}

function busyCount(m: MashgiachForAssign, dateFrom: string, dateTo: string) {
  if (!dateFrom) return 0;
  const from = new Date(dateFrom + "T00:00:00");
  const to   = new Date((dateTo || dateFrom) + "T23:59:59");
  return m.assignments.filter((a) => {
    const s = new Date(a.scheduledAt);
    const e = a.scheduledEnd ? new Date(a.scheduledEnd) : s;
    return s <= to && e >= from;
  }).length;
}

export function QuickAssignDialog({
  projectId, siteId, organizationId, projectType, projectName,
  plannedVisitAt, plannedVisitEnd, existingAssignment, onClose,
}: Props) {
  const router = useRouter();
  const isEditMode = !!existingAssignment;
  const [mashgichim, setMashgichim] = useState<MashgiachForAssign[]>([]);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<Slot[]>(() => {
    if (existingAssignment) {
      return [{
        key: Math.random().toString(36).slice(2),
        assignmentId: existingAssignment.id,
        mashgiachId: existingAssignment.mashgiachId,
        dateFrom: existingAssignment.dateFrom,
        timeFrom: existingAssignment.timeFrom,
        dateTo: existingAssignment.dateTo,
        timeTo: existingAssignment.timeTo,
        pickerOpen: false,
        pickerSearch: "",
        error: "",
        conflictWarning: "",
        forceOverride: false,
      }];
    }
    return [makeSlot(plannedVisitAt, plannedVisitEnd)];
  });
  const [globalError, setGlobalError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [successCount, setSuccessCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    getMashgichimForAssign(organizationId).then((data) => {
      setMashgichim(data as MashgiachForAssign[]);
      setLoading(false);
    });
  }, [organizationId]);

  function patch(key: string, p: Partial<Slot>) {
    setSlots((prev) => prev.map((s) => (s.key === key ? { ...s, ...p } : s)));
  }

  function addSlot() {
    const last = slots[slots.length - 1];
    setSlots((prev) => [...prev, makeSlot(last.dateFrom, last.dateTo)]);
  }

  async function submitSlot(slot: Slot, force = false) {
    try {
      if (slot.assignmentId) {
        await updateAssignment(slot.assignmentId, {
          mashgiachId: slot.mashgiachId,
          scheduledAt: new Date(`${slot.dateFrom}T${slot.timeFrom}:00`),
          scheduledEnd: new Date(`${slot.dateTo}T${slot.timeTo}:00`),
          forceOverride: force,
        });
      } else {
        await createAssignment({
          organizationId, projectId, siteId,
          mashgiachId: slot.mashgiachId,
          type: VISIT_TYPE_MAP[projectType] ?? "SPECIFIC",
          scheduledAt: new Date(`${slot.dateFrom}T${slot.timeFrom}:00`),
          scheduledEnd: new Date(`${slot.dateTo}T${slot.timeTo}:00`),
          forceOverride: force,
        });
      }
      return "ok";
    } catch (e) {
      const msg = e instanceof Error ? e.message : "שגיאה";
      if (msg.startsWith("CONFLICT:")) {
        patch(slot.key, { conflictWarning: msg.slice(9), error: "", forceOverride: false });
        return "conflict";
      }
      const displayMsg = msg.startsWith("DUPLICATE:") ? msg.slice(10) : msg;
      patch(slot.key, { error: displayMsg, conflictWarning: "" });
      return "error";
    }
  }

  async function submit() {
    const ready = slots.filter((s) => s.mashgiachId && s.dateFrom);
    if (!ready.length) { setGlobalError("יש לבחור לפחות משגיח אחד ותאריך"); return; }
    setGlobalError("");
    setSlots((prev) => prev.map((s) => ({ ...s, error: "", conflictWarning: "" })));

    startTransition(async () => {
      let ok = 0, conflicts = 0, errors = 0;
      for (const slot of ready) {
        const result = await submitSlot(slot, slot.forceOverride);
        if (result === "ok") ok++;
        else if (result === "conflict") conflicts++;
        else errors++;
      }
      setSuccessCount(ok);
      if (ok === ready.length) {
        setDone(true);
        router.refresh();
        setTimeout(onClose, 1400);
      } else if (conflicts > 0) {
        setGlobalError("יש קונפליקטים — ראה פרטים למטה ואשר שיבוץ לפי הצורך");
      } else {
        setGlobalError(`${ok} שיבוצים נוצרו · ${errors} נכשלו`);
      }
    });
  }

  async function removeAssignment(key: string, assignmentId: string) {
    startTransition(async () => {
      await deleteAssignment(assignmentId);
      setSlots((prev) => prev.filter((s) => s.key !== key));
      router.refresh();
      const remaining = slots.filter((s) => s.key !== key);
      if (remaining.length === 0) onClose();
    });
  }

  async function overrideSlot(key: string) {
    const slot = slots.find((s) => s.key === key);
    if (!slot) return;
    patch(key, { conflictWarning: "", error: "", forceOverride: true });

    startTransition(async () => {
      const updatedSlot = { ...slot, forceOverride: true };
      const result = await submitSlot(updatedSlot, true);
      if (result === "ok") {
        const remaining = slots.filter((s) => s.key !== key && s.mashgiachId && !s.conflictWarning);
        const allDone = remaining.length === 0 && slots.every((s) => s.key === key || !s.mashgiachId || s.conflictWarning === "");
        router.refresh();
        if (allDone) {
          setDone(true);
          setTimeout(onClose, 1400);
        }
      }
    });
  }

  const filledCount = slots.filter((s) => s.mashgiachId).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh]">

        {/* ── Header ── */}
        <div className="flex items-start justify-between p-5 border-b bg-white rounded-t-2xl">
          <div>
            <h2 className="font-bold text-gray-900 text-base">{isEditMode ? "עריכת שיבוץ" : "שיבוץ מהיר"}</h2>
            <p className="text-sm text-gray-500 mt-0.5 leading-tight">{projectName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1 -mt-1 -me-1">✕</button>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">

          {loading ? (
            <div className="py-12 text-center text-gray-400">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              טוען משגיחים...
            </div>
          ) : (
            <>
              {slots.map((slot, idx) => {
                const selected = mashgichim.find((m) => m.id === slot.mashgiachId);
                const selectedAvail = selected ? getAvail(selected, slot.dateFrom, slot.dateTo) : null;

                const sortedM = [...mashgichim]
                  .filter((m) =>
                    !slot.pickerSearch ||
                    m.name.includes(slot.pickerSearch) ||
                    (m.city ?? "").includes(slot.pickerSearch)
                  )
                  .sort((a, b) => {
                    const o = { free: 0, partial: 1, busy: 2 };
                    return o[getAvail(a, slot.dateFrom, slot.dateTo)] - o[getAvail(b, slot.dateFrom, slot.dateTo)];
                  });

                return (
                  <div key={slot.key} className="border border-gray-200 rounded-xl overflow-hidden">

                    {/* Slot header bar */}
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                      <span className="text-xs font-medium text-gray-500">משגיח {idx + 1}</span>
                      <div className="flex items-center gap-3">
                        {slot.assignmentId && (
                          <button
                            onClick={() => removeAssignment(slot.key, slot.assignmentId!)}
                            disabled={isPending}
                            className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors disabled:opacity-40"
                          >
                            🗑 הסר שיבוץ
                          </button>
                        )}
                        {slots.length > 1 && !slot.assignmentId && (
                          <button
                            onClick={() => setSlots((p) => p.filter((s) => s.key !== slot.key))}
                            className="text-xs text-red-400 hover:text-red-600 transition-colors"
                          >
                            הסר
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Mashgiach picker */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      {!slot.pickerOpen && selected ? (
                        /* Selected state */
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {selected.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{selected.name}</p>
                            {selected.city && <p className="text-xs text-gray-400">{selected.city}</p>}
                          </div>
                          {selectedAvail && (
                            <span
                              className="text-xs font-medium flex items-center gap-1.5 flex-shrink-0"
                              style={{ color: AVAIL[selectedAvail].text }}
                            >
                              <span className="w-2 h-2 rounded-full" style={{ background: AVAIL[selectedAvail].dot }} />
                              {AVAIL[selectedAvail].label}
                            </span>
                          )}
                          <button
                            onClick={() => patch(slot.key, { pickerOpen: true })}
                            className="text-xs text-blue-600 hover:underline flex-shrink-0"
                          >
                            שנה
                          </button>
                        </div>
                      ) : (
                        /* Picker open state */
                        <div>
                          <input
                            type="search"
                            autoFocus={idx === slots.length - 1}
                            value={slot.pickerSearch}
                            onChange={(e) => patch(slot.key, { pickerSearch: e.target.value })}
                            placeholder="חיפוש שם / עיר..."
                            className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="max-h-44 overflow-y-auto space-y-0.5">
                            {sortedM.length === 0 && (
                              <p className="text-center py-4 text-sm text-gray-400">אין משגיחים</p>
                            )}
                            {sortedM.map((m) => {
                              const av = getAvail(m, slot.dateFrom, slot.dateTo);
                              const c  = AVAIL[av];
                              const bc = busyCount(m, slot.dateFrom, slot.dateTo);
                              return (
                                <button
                                  key={m.id}
                                  onClick={() => patch(slot.key, { mashgiachId: m.id, pickerOpen: false, pickerSearch: "" })}
                                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-blue-50 text-right transition-colors"
                                >
                                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700 flex-shrink-0">
                                    {m.name.charAt(0)}
                                  </div>
                                  <div className="flex-1 min-w-0 text-right">
                                    <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
                                    <p className="text-xs text-gray-400">
                                      {m.city ?? ""}
                                      {bc > 0 ? ` · ${bc} שיבוצ${bc === 1 ? "" : "ים"} בטווח` : ""}
                                    </p>
                                  </div>
                                  <span className="flex items-center gap-1 text-xs flex-shrink-0" style={{ color: c.text }}>
                                    <span className="w-2 h-2 rounded-full" style={{ background: c.dot }} />
                                    {c.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Dates + times */}
                    <div className="px-4 py-3 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">מתאריך</label>
                        <div className="flex gap-1">
                          <input
                            type="date"
                            value={slot.dateFrom}
                            onChange={(e) =>
                              patch(slot.key, {
                                dateFrom: e.target.value,
                                dateTo: slot.dateTo < e.target.value ? e.target.value : slot.dateTo,
                              })
                            }
                            className="flex-1 min-w-0 rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <input
                            type="time"
                            value={slot.timeFrom}
                            onChange={(e) => patch(slot.key, { timeFrom: e.target.value })}
                            className="w-[68px] rounded-lg border border-gray-200 px-1 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">עד תאריך</label>
                        <div className="flex gap-1">
                          <input
                            type="date"
                            value={slot.dateTo}
                            min={slot.dateFrom}
                            onChange={(e) => patch(slot.key, { dateTo: e.target.value })}
                            className="flex-1 min-w-0 rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <input
                            type="time"
                            value={slot.timeTo}
                            onChange={(e) => patch(slot.key, { timeTo: e.target.value })}
                            className="w-[68px] rounded-lg border border-gray-200 px-1 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {slot.conflictWarning && (
                      <div className="mx-4 mb-3 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5">
                        <p className="text-xs text-amber-800 mb-2 leading-snug">
                          ⚠ {slot.conflictWarning}
                        </p>
                        <button
                          onClick={() => overrideSlot(slot.key)}
                          disabled={isPending}
                          className="text-xs bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-3 py-1.5 font-medium transition-colors disabled:opacity-50"
                        >
                          שבץ בכל זאת
                        </button>
                      </div>
                    )}

                    {slot.error && (
                      <div className="mx-4 mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                        {slot.error}
                      </div>
                    )}
                  </div>
                );
              })}

              {slots.length < 6 && (
                <button
                  onClick={addSlot}
                  className="w-full border-2 border-dashed border-blue-200 rounded-xl py-3 text-sm text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-colors font-medium"
                >
                  + הוסף משגיח נוסף
                </button>
              )}
            </>
          )}
        </div>

        {globalError && (
          <div className="mx-4 mb-1 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
            {globalError}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="px-5 py-4 border-t bg-gray-50 rounded-b-2xl flex gap-3">
          <button
            onClick={submit}
            disabled={isPending || done || filledCount === 0}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
              done
                ? "bg-green-600 text-white cursor-default"
                : "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white"
            }`}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isEditMode ? "מעדכן..." : "יוצר שיבוצים..."}
              </span>
            ) : done ? (
              isEditMode ? "✓ שיבוץ עודכן" : `✓ ${successCount} שיבוצ${successCount === 1 ? "" : "ים"} נוצרו`
            ) : isEditMode ? (
              "עדכן"
            ) : filledCount > 1 ? (
              `שבץ (${filledCount})`
            ) : (
              "שבץ"
            )}
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
