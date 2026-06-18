"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createHologramBatch } from "@/actions/holograms";

const ORG_ID = "org_demo";

type CertBody = { id: string; name: string };

export function NewHologramBatchForm({ certBodies }: { certBodies: CertBody[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [certBodyId, setCertBodyId] = useState("");

  const count = from && to ? Math.max(0, parseInt(to) - parseInt(from) + 1) : 0;
  const selectedCertBody = certBodies.find((cb) => cb.id === certBodyId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const rangeFrom = parseInt(from);
    const rangeTo = parseInt(to);
    if (rangeTo < rangeFrom) {
      setError("המספר האחרון חייב להיות גדול מהראשון");
      return;
    }
    if (!certBodyId) {
      setError("נא לבחור גוף כשרות");
      return;
    }
    setSaving(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      await createHologramBatch({
        organizationId: ORG_ID,
        certBodyId,
        rangeFrom,
        rangeTo,
        notes: (fd.get("notes") as string) || undefined,
      });
      router.push("/holograms");
    } catch {
      setError("שגיאה בשמירה");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 space-y-5">
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
        <p className="font-medium mb-1">הוראות</p>
        <p>הזן את גוף הכשרות וטווח המספרים הסידוריים שהתקבלו. כל מנה שייכת לגוף כשרות אחד.</p>
      </div>

      {/* Cert body */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          גוף כשרות <span className="text-red-500">*</span>
        </label>
        <select
          value={certBodyId}
          onChange={(e) => setCertBodyId(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">בחר גוף כשרות...</option>
          {certBodies.map((cb) => (
            <option key={cb.id} value={cb.id}>{cb.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">מספר סידורי ראשון <span className="text-red-500">*</span></label>
          <input
            type="number"
            required
            min="1"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="10001"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">מספר סידורי אחרון <span className="text-red-500">*</span></label>
          <input
            type="number"
            required
            min="1"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="10500"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {count > 0 && selectedCertBody && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm font-medium text-green-700">
          ✓ {count.toLocaleString()} הולוגרמות של <span className="font-bold">{selectedCertBody.name}</span>
          {" "}· טווח {parseInt(from).toLocaleString()}–{parseInt(to).toLocaleString()}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">הערות</label>
        <textarea
          name="notes"
          rows={3}
          placeholder="מספר הזמנה, ספק, הערות נוספות..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">⚠ {error}</div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || count === 0 || !certBodyId}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "שומר..." : "שמור מנה"}
        </button>
        <a href="/holograms" className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 text-center">
          ביטול
        </a>
      </div>
    </form>
  );
}
