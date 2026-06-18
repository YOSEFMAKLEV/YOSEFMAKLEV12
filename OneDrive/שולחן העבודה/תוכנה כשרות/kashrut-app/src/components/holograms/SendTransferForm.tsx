"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTransfer } from "@/actions/holograms";

type Batch = { id: string; rangeFrom: number; rangeTo: number; notes: string | null; certBodyName?: string | null };
type Mashgiach = { id: string; name: string };

export function SendTransferForm({
  orgId,
  batches,
  mashgichim,
  senderMashgiachId,
}: {
  orgId: string;
  batches: Batch[];
  mashgichim: Mashgiach[];
  senderMashgiachId?: string; // set when a mashgiach is sending
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [batchId, setBatchId] = useState("");
  const [toMashgiachId, setToMashgiachId] = useState("");
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [notes, setNotes] = useState("");
  const [toType, setToType] = useState<"MASHGIACH" | "ORG">("MASHGIACH");

  const selectedBatch = batches.find((b) => b.id === batchId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const from = parseInt(rangeFrom);
    const to = parseInt(rangeTo);

    if (!batchId || isNaN(from) || isNaN(to)) {
      setError("נא למלא את כל השדות");
      setSaving(false);
      return;
    }
    if (from > to) {
      setError("מספר התחלה חייב להיות קטן ממספר הסיום");
      setSaving(false);
      return;
    }
    if (selectedBatch && (from < selectedBatch.rangeFrom || to > selectedBatch.rangeTo)) {
      setError(`הטווח חייב להיות בין ${selectedBatch.rangeFrom.toLocaleString()} ל-${selectedBatch.rangeTo.toLocaleString()}`);
      setSaving(false);
      return;
    }
    if (toType === "MASHGIACH" && !toMashgiachId) {
      setError("נא לבחור משגיח");
      setSaving(false);
      return;
    }

    try {
      await createTransfer({
        organizationId: orgId,
        batchId,
        rangeFrom: from,
        rangeTo: to,
        fromType: senderMashgiachId ? "MASHGIACH" : "ORG",
        fromMashgiachId: senderMashgiachId,
        toType,
        toMashgiachId: toType === "MASHGIACH" ? toMashgiachId : undefined,
        notes: notes || undefined,
      });
      setOpen(false);
      setBatchId(""); setToMashgiachId(""); setRangeFrom(""); setRangeTo(""); setNotes("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setSaving(false);
    }
  }

  const label = senderMashgiachId
    ? (toType === "ORG" ? "החזר למשרד" : "העבר למשגיח אחר")
    : "שלח למשגיח";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        + {senderMashgiachId ? "העברה / החזרה" : "שלח למשגיח"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 mx-4" dir="rtl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {senderMashgiachId ? "העברת הולוגרמות" : "שליחת הולוגרמות למשגיח"}
              </h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Destination type — only for mashgiach senders */}
              {senderMashgiachId && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setToType("MASHGIACH")}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border ${toType === "MASHGIACH" ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                  >
                    למשגיח אחר
                  </button>
                  <button
                    type="button"
                    onClick={() => setToType("ORG")}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border ${toType === "ORG" ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                  >
                    החזר למשרד
                  </button>
                </div>
              )}

              {/* Batch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מנה <span className="text-red-500">*</span></label>
                <select
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">בחר מנה...</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.certBodyName ? `[${b.certBodyName}] ` : ""}{b.rangeFrom.toLocaleString()} – {b.rangeTo.toLocaleString()}{b.notes ? ` (${b.notes})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">מ-מספר <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={rangeFrom}
                    onChange={(e) => setRangeFrom(e.target.value)}
                    placeholder={selectedBatch ? String(selectedBatch.rangeFrom) : ""}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">עד-מספר <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={rangeTo}
                    onChange={(e) => setRangeTo(e.target.value)}
                    placeholder={selectedBatch ? String(selectedBatch.rangeTo) : ""}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {selectedBatch && (
                <div className="flex items-center gap-3">
                  {selectedBatch.certBodyName && (
                    <span className="inline-block rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      {selectedBatch.certBodyName}
                    </span>
                  )}
                  {rangeFrom && rangeTo && parseInt(rangeFrom) <= parseInt(rangeTo) && (
                    <p className="text-xs text-blue-600 font-medium">
                      כמות: {(parseInt(rangeTo) - parseInt(rangeFrom) + 1).toLocaleString()} הולוגרמות
                    </p>
                  )}
                </div>
              )}

              {/* To mashgiach — shown when destination is MASHGIACH */}
              {toType === "MASHGIACH" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {senderMashgiachId ? "משגיח מקבל" : "שלח אל משגיח"} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={toMashgiachId}
                    onChange={(e) => setToMashgiachId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">בחר משגיח...</option>
                    {mashgichim
                      .filter((m) => m.id !== senderMashgiachId)
                      .map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                  </select>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">הערות</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="הערות לגבי ההעברה..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  ⚠ {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "שולח..." : label}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
