"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveReport } from "@/actions/reports";

type ExistingReport = {
  checkIn: Date | null;
  checkOut: Date | null;
  internalNotes: string | null;
  rabbinateNotes: string | null;
  findings: string | null;
  issues: string | null;
  hologramFrom: number | null;
  hologramTo: number | null;
  status: string;
};

function toDatetimeLocal(d: Date | null): string {
  if (!d) return "";
  const dt = new Date(d);
  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
  return dt.toISOString().slice(0, 16);
}

export function AssignmentReportForm({
  assignmentId,
  siteInternalReport,
  siteRabbinateReport,
  existingReport,
}: {
  assignmentId: string;
  siteInternalReport: boolean;
  siteRabbinateReport: boolean;
  existingReport: ExistingReport | null;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [submitType, setSubmitType] = useState<"DRAFT" | "SUBMITTED">("DRAFT");
  const [hologramFrom, setHologramFrom] = useState(existingReport?.hologramFrom?.toString() ?? "");
  const [hologramTo, setHologramTo] = useState(existingReport?.hologramTo?.toString() ?? "");
  const [error, setError] = useState("");
  const isSubmitted = existingReport?.status === "SUBMITTED" || existingReport?.status === "APPROVED";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const fd = new FormData(e.currentTarget);

    const checkInStr = fd.get("checkIn") as string;
    const checkOutStr = fd.get("checkOut") as string;
    const hFrom = hologramFrom ? parseInt(hologramFrom) : undefined;
    const hTo = hologramTo ? parseInt(hologramTo) : undefined;

    if (hFrom && hTo && hTo < hFrom) {
      setError("מספר הולוגרמה הסופי חייב להיות גדול מהמספר ההתחלתי");
      setSaving(false);
      return;
    }

    try {
      await saveReport({
        assignmentId,
        checkIn: checkInStr ? new Date(checkInStr) : undefined,
        checkOut: checkOutStr ? new Date(checkOutStr) : undefined,
        internalNotes: (fd.get("internalNotes") as string) || undefined,
        rabbinateNotes: (fd.get("rabbinateNotes") as string) || undefined,
        findings: (fd.get("findings") as string) || undefined,
        issues: (fd.get("issues") as string) || undefined,
        hologramFrom: hFrom,
        hologramTo: hTo,
        status: submitType,
      });
      router.refresh();
    } catch {
      setError("שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  }

  const hologramCount = hologramFrom && hologramTo
    ? Math.max(0, parseInt(hologramTo) - parseInt(hologramFrom) + 1)
    : 0;

  return (
    <div className="rounded-xl border bg-white">
      <div className="px-5 py-4 border-b flex justify-between items-center">
        <h2 className="font-semibold text-gray-900">דו"ח ביקור</h2>
        {existingReport && (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isSubmitted ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
          }`}>
            {isSubmitted ? "הוגש" : "טיוטה"}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-5">
        {/* Check-in / Check-out */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שעת כניסה</label>
            <input
              name="checkIn"
              type="datetime-local"
              defaultValue={toDatetimeLocal(existingReport?.checkIn ?? null)}
              disabled={isSubmitted}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שעת יציאה</label>
            <input
              name="checkOut"
              type="datetime-local"
              defaultValue={toDatetimeLocal(existingReport?.checkOut ?? null)}
              disabled={isSubmitted}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>
        </div>

        {/* Holograms */}
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
          <h3 className="text-sm font-semibold text-amber-900 mb-3">הולוגרמות</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">מספר סידורי ראשון</label>
              <input
                type="number"
                value={hologramFrom}
                onChange={(e) => setHologramFrom(e.target.value)}
                disabled={isSubmitted}
                placeholder="למשל: 10001"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">מספר סידורי אחרון</label>
              <input
                type="number"
                value={hologramTo}
                onChange={(e) => setHologramTo(e.target.value)}
                disabled={isSubmitted}
                placeholder="למשל: 10050"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:bg-gray-50"
              />
            </div>
          </div>
          {hologramCount > 0 && (
            <p className="mt-2 text-sm text-amber-800 font-medium">
              סה"כ: {hologramCount} הולוגרמות ({hologramFrom}–{hologramTo})
            </p>
          )}
        </div>

        {/* Findings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ממצאים ותיאור הביקור</label>
          <textarea
            name="findings"
            rows={4}
            defaultValue={existingReport?.findings ?? ""}
            disabled={isSubmitted}
            placeholder="תאר את מהלך הביקור, מה נבדק, אילו פעולות בוצעו..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>

        {/* Issues */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">חריגות ובעיות</label>
          <textarea
            name="issues"
            rows={3}
            defaultValue={existingReport?.issues ?? ""}
            disabled={isSubmitted}
            placeholder="האם נמצאו בעיות או חריגות? פרט..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>

        {/* Internal notes */}
        {siteInternalReport && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">הערות פנימיות (לארכיון)</label>
            <textarea
              name="internalNotes"
              rows={3}
              defaultValue={existingReport?.internalNotes ?? ""}
              disabled={isSubmitted}
              placeholder={'הערות פנימיות שלא נכנסות לדו"ח הרבנות...'}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>
        )}

        {/* Rabbinate notes */}
        {siteRabbinateReport && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <label className="block text-sm font-medium text-blue-900 mb-1">הערות לדו"ח רבנות</label>
            <textarea
              name="rabbinateNotes"
              rows={4}
              defaultValue={existingReport?.rabbinateNotes ?? ""}
              disabled={isSubmitted}
              placeholder={'טקסט שייכנס אוטומטית לדו"ח הרבנות...'}
              className="w-full rounded-lg border border-blue-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">⚠ {error}</div>
        )}

        {!isSubmitted && (
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              onClick={() => setSubmitType("DRAFT")}
              disabled={saving}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {saving && submitType === "DRAFT" ? "שומר..." : "שמור טיוטה"}
            </button>
            <button
              type="submit"
              onClick={() => setSubmitType("SUBMITTED")}
              disabled={saving}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving && submitType === "SUBMITTED" ? "מגיש..." : "הגש דו\"ח סופי"}
            </button>
          </div>
        )}

        {isSubmitted && (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 text-center">
            ✓ הדו"ח הוגש בהצלחה
          </div>
        )}
      </form>
    </div>
  );
}
