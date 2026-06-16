"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { issueCertificate } from "@/actions/certificates";

const ORG_ID = "org_demo";

type Project = {
  id: string;
  type: string;
  status: string;
  client: { id: string; name: string };
  site: { name: string };
};
type CertBody = { id: string; name: string };

export function IssueCertificateForm({
  projects,
  certBodies,
  defaultProjectId,
}: {
  projects: Project[];
  certBodies: CertBody[];
  defaultProjectId?: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId ?? "");

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Default expiry = 1 year from today
  const defaultExpiry = new Date();
  defaultExpiry.setFullYear(defaultExpiry.getFullYear() + 1);
  const defaultExpiryStr = defaultExpiry.toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedProjectId) { setError("בחר פרויקט"); return; }
    setSaving(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      await issueCertificate({
        organizationId: ORG_ID,
        projectId: selectedProjectId,
        clientId: selectedProject!.client.id,
        certBodyId: (fd.get("certBodyId") as string) || undefined,
        expiresAt: new Date(fd.get("expiresAt") as string),
      });
      router.push("/certificates");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
      setSaving(false);
    }
  }

  const TYPE_LABELS: Record<string, string> = { ANNUAL: "שנתי", LAB: "מעבדה", SPECIFIC: "ספציפי" };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 space-y-5">

      {/* Project */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">פרויקט <span className="text-red-500">*</span></label>
        <select
          required
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>בחר פרויקט...</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.client.name} — {p.site.name} ({TYPE_LABELS[p.type] ?? p.type})
            </option>
          ))}
        </select>
        {selectedProject && (
          <p className="mt-1 text-xs text-gray-500">לקוח: {selectedProject.client.name}</p>
        )}
      </div>

      {/* Cert body */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">גוף מכשיר</label>
        <select name="certBodyId" defaultValue="" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">— בחר גוף מכשיר —</option>
          {certBodies.map((cb) => (
            <option key={cb.id} value={cb.id}>{cb.name}</option>
          ))}
        </select>
      </div>

      {/* Expiry date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">תוקף עד <span className="text-red-500">*</span></label>
        <input
          name="expiresAt"
          type="date"
          required
          defaultValue={defaultExpiryStr}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-xs text-gray-400">
          התראה תישלח 30 ו-60 יום לפני פקיעת התוקף
        </p>
      </div>

      {/* Info about cert release */}
      {selectedProject && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm">
          <p className="text-blue-800">
            <span className="font-medium">מדיניות שחרור:</span>{" "}
            התעודה תיבדק לפי הגדרות הלקוח — שחרור מיידי או ממתין לאישור תשלום.
          </p>
        </div>
      )}

      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">⚠ {error}</div>}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {saving ? "מנפיק..." : "הנפק תעודה"}
        </button>
        <a href="/certificates" className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 text-center">ביטול</a>
      </div>
    </form>
  );
}
