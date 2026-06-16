"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAssignment } from "@/actions/assignments";

const ORG_ID = "org_demo";

type Mashgiach = { id: string; name: string; citizenships: string[]; activeRegions: string[] };
type Site = { id: string; name: string; country: string; timezone: string; client: { id: string; name: string } };
type Project = { id: string; type: string; status: string; client: { name: string }; site: { name: string } };

export function NewAssignmentForm({
  mashgichim,
  sites,
  projects,
  defaultDate,
  defaultMashgiachId,
  defaultProjectId,
}: {
  mashgichim: Mashgiach[];
  sites: Site[];
  projects: Project[];
  defaultDate?: string;
  defaultMashgiachId?: string;
  defaultProjectId?: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedMashgiachId, setSelectedMashgiachId] = useState(defaultMashgiachId ?? "");
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId ?? "");

  const selectedSite = sites.find((s) => s.id === selectedSiteId);
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Smart matching: filter mashgichim by site's region
  const suggestedMashgichim = selectedSite
    ? mashgichim.filter((m) =>
        m.activeRegions.length === 0 ||
        m.activeRegions.some((r) =>
          r === selectedSite.country ||
          (selectedSite.country === "ישראל" && r === "ישראל") ||
          r === "ישראל" // can always go to Israel
        )
      )
    : mashgichim;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const fd = new FormData(e.currentTarget);

    const projectId = selectedProjectId || (fd.get("projectId") as string);
    const siteId = selectedSiteId || (fd.get("siteId") as string);
    const mashgiachId = selectedMashgiachId || (fd.get("mashgiachId") as string);

    if (!projectId || !siteId || !mashgiachId) {
      setError("נא למלא את כל השדות החובה");
      setSaving(false);
      return;
    }

    const scheduledAt = new Date(fd.get("scheduledAt") as string);
    const scheduledEndStr = fd.get("scheduledEnd") as string;
    const scheduledEnd = scheduledEndStr ? new Date(scheduledEndStr) : undefined;

    try {
      await createAssignment({
        organizationId: ORG_ID,
        projectId,
        siteId,
        mashgiachId,
        type: fd.get("type") as "ANNUAL" | "SPECIFIC" | "CONTINUOUS" | "INITIAL",
        scheduledAt,
        scheduledEnd,
        instructions: (fd.get("instructions") as string) || undefined,
        siteArrangesTravel: fd.get("siteArrangesTravel") === "true",
        travelDetails: (fd.get("travelDetails") as string) || undefined,
      });
      router.push("/scheduling");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בשמירה");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 space-y-5">

      {/* Project */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">פרויקט <span className="text-red-500">*</span></label>
        <select
          required
          value={selectedProjectId}
          onChange={(e) => {
            setSelectedProjectId(e.target.value);
            const proj = projects.find((p) => p.id === e.target.value);
            // auto-set site if project has one
          }}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>בחר פרויקט...</option>
          {projects
            .filter((p) => p.status === "PENDING" || p.status === "ACTIVE")
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.client.name} — {p.site.name} ({p.type === "ANNUAL" ? "שנתי" : p.type === "LAB" ? "מעבדה" : "ספציפי"})
              </option>
            ))}
        </select>
      </div>

      {/* Site */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">אתר <span className="text-red-500">*</span></label>
        <select
          required
          value={selectedSiteId}
          onChange={(e) => setSelectedSiteId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>בחר אתר...</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>{s.name} — {s.country} ({s.timezone})</option>
          ))}
        </select>
        {selectedSite && (
          <p className="mt-1 text-xs text-gray-500">
            🌐 אזור זמן: <span className="font-medium">{selectedSite.timezone}</span>
            {selectedSite.country !== "ישראל" && " · שימו לב לפרש שעות בזמן מקומי של האתר"}
          </p>
        )}
      </div>

      {/* Mashgiach */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          משגיח <span className="text-red-500">*</span>
          {selectedSite && <span className="text-xs text-blue-600 ms-2">· מומלצים לפי אזור</span>}
        </label>
        <select
          required
          value={selectedMashgiachId}
          onChange={(e) => setSelectedMashgiachId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>בחר משגיח...</option>
          {selectedSite && suggestedMashgichim.length > 0 && (
            <optgroup label="✓ מומלצים לאזור זה">
              {suggestedMashgichim.map((m) => (
                <option key={m.id} value={m.id}>{m.name} · {m.citizenships.join(", ")}</option>
              ))}
            </optgroup>
          )}
          {selectedSite && mashgichim.filter((m) => !suggestedMashgichim.includes(m)).length > 0 && (
            <optgroup label="אחרים">
              {mashgichim.filter((m) => !suggestedMashgichim.includes(m)).map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </optgroup>
          )}
          {!selectedSite && mashgichim.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">סוג ביקור <span className="text-red-500">*</span></label>
        <select name="type" required defaultValue="ANNUAL" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="ANNUAL">שנתי</option>
          <option value="SPECIFIC">ייצור ספציפי</option>
          <option value="INITIAL">ביקור ראשוני</option>
          <option value="CONTINUOUS">רציף</option>
        </select>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">תאריך ושעת התחלה <span className="text-red-500">*</span></label>
          <input
            name="scheduledAt"
            type="datetime-local"
            required
            defaultValue={defaultDate ? `${defaultDate}T09:00` : ""}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">תאריך ושעת סיום</label>
          <input
            name="scheduledEnd"
            type="datetime-local"
            defaultValue={defaultDate ? `${defaultDate}T17:00` : ""}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Travel */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
        <h3 className="text-sm font-semibold text-amber-900 mb-3">לוגיסטיקת נסיעה</h3>
        <label className="flex items-center gap-2 mb-3 cursor-pointer">
          <input type="checkbox" name="siteArrangesTravel" value="true" className="rounded accent-blue-600" />
          <span className="text-sm text-gray-700">האתר מסדר את הנסיעה (טיסה / רכב / מלון)</span>
        </label>
        <div>
          <label className="block text-xs text-gray-600 mb-1">פרטי נסיעה / הנחיות הגעה</label>
          <textarea name="travelDetails" rows={2} placeholder="פרטי טיסה, מלון, שם נהג, מספר טלפון..." className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm resize-none focus:outline-none" />
        </div>
      </div>

      {/* Instructions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">הנחיות למשגיח</label>
        <textarea name="instructions" rows={3} placeholder="הנחיות מיוחדות לביקור זה..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          ⚠ {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {saving ? "שומר..." : "צור שיבוץ"}
        </button>
        <a href="/scheduling" className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 text-center">ביטול</a>
      </div>
    </form>
  );
}
