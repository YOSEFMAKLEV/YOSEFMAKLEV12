"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject } from "@/actions/projects";

type Client = { id: string; name: string };
type Site = { id: string; name: string; country: string; client: { id: string; name: string } };
type CertBody = { id: string; name: string };

const PROJECT_TYPES = [
  { value: "ANNUAL", label: "שנתי" },
  { value: "LAB", label: "בדיקת מעבדה" },
  { value: "SPECIFIC", label: "ייצור ספציפי" },
] as const;

export function NewProjectForm({
  clients, sites, certBodies, orgId, defaultClientId, defaultSiteId,
}: {
  clients: Client[];
  sites: Site[];
  certBodies: CertBody[];
  orgId: string;
  defaultClientId?: string;
  defaultSiteId?: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [clientId, setClientId] = useState(defaultClientId ?? "");
  const [siteId, setSiteId] = useState(defaultSiteId ?? "");
  const [type, setType] = useState<"ANNUAL" | "LAB" | "SPECIFIC">("ANNUAL");
  const [certBodyId, setCertBodyId] = useState("");
  const [plannedVisit, setPlannedVisit] = useState("");
  const [notes, setNotes] = useState("");

  const clientSites = sites.filter((s) => !clientId || s.client.id === clientId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId || !siteId) { setError("בחר לקוח ואתר"); return; }
    setSaving(true);
    setError("");
    try {
      const project = await createProject({
        organizationId: orgId,
        clientId,
        siteId,
        type,
        certBodyId: certBodyId || undefined,
        plannedVisitAt: plannedVisit ? new Date(plannedVisit) : undefined,
        notes: notes || undefined,
      });
      router.push(`/projects`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">לקוח <span className="text-red-500">*</span></label>
        <select required value={clientId} onChange={(e) => { setClientId(e.target.value); setSiteId(""); }}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="" disabled>בחר לקוח...</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">אתר / מפעל <span className="text-red-500">*</span></label>
        <select required value={siteId} onChange={(e) => setSiteId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="" disabled>בחר אתר...</option>
          {clientSites.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.country})</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">סוג פרויקט</label>
        <div className="flex gap-3">
          {PROJECT_TYPES.map((pt) => (
            <button type="button" key={pt.value} onClick={() => setType(pt.value)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${type === pt.value ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
              {pt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">גוף מכשיר</label>
        <select value={certBodyId} onChange={(e) => setCertBodyId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">— בחר גוף מכשיר (אופציונלי) —</option>
          {certBodies.map((cb) => <option key={cb.id} value={cb.id}>{cb.name}</option>)}
        </select>
      </div>

      {type !== "LAB" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">תאריך ביקור מתוכנן</label>
          <input type="date" value={plannedVisit} onChange={(e) => setPlannedVisit(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">הערות</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">⚠ {error}</div>}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {saving ? "שומר..." : "צור פרויקט"}
        </button>
        <a href="/projects" className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 text-center">ביטול</a>
      </div>
    </form>
  );
}
