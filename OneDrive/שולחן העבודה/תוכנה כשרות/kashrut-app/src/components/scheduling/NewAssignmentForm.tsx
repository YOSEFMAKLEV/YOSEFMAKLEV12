"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAssignment } from "@/actions/assignments";

const ORG_ID = "org_demo";
const ISRAEL_TZ = "Asia/Jerusalem";

type Mashgiach = { id: string; name: string; citizenships: string[]; activeRegions: string[] };
type Site = { id: string; name: string; country: string; timezone: string; client: { id: string; name: string } };
type Project = { id: string; type: string; status: string; client: { name: string }; site: { name: string } };

/** Format a Date in a given IANA timezone (Hebrew locale) */
function formatInTz(date: Date, tz: string, opts?: Intl.DateTimeFormatOptions): string {
  try {
    return new Intl.DateTimeFormat("he-IL", {
      timeZone: tz,
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      ...opts,
    }).format(date);
  } catch {
    return "";
  }
}

/**
 * datetime-local value ("2024-06-15T09:00") is interpreted by the browser
 * as LOCAL time. Convert it to a Date, then display in the target timezone.
 */
function localStrToDate(localStr: string): Date | null {
  if (!localStr) return null;
  // Append ":00" so Safari parses it too
  return new Date(localStr.length === 16 ? localStr + ":00" : localStr);
}

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
  const [scheduledAt, setScheduledAt] = useState(defaultDate ? `${defaultDate}T09:00` : "");
  const [scheduledEnd, setScheduledEnd] = useState(defaultDate ? `${defaultDate}T17:00` : "");

  const selectedSite = sites.find((s) => s.id === selectedSiteId);
  const siteTz = selectedSite?.timezone ?? ISRAEL_TZ;
  const isLocalSite = siteTz === ISRAEL_TZ;

  // Smart matching: filter mashgichim by site's region
  const suggestedMashgichim = selectedSite
    ? mashgichim.filter((m) =>
        m.activeRegions.length === 0 ||
        m.activeRegions.some((r) => r === selectedSite.country || r === "IL")
      )
    : mashgichim;

  // Current time at site
  const nowAtSite = formatInTz(new Date(), siteTz, {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  });

  // Converted times for display
  const startDate = localStrToDate(scheduledAt);
  const endDate   = localStrToDate(scheduledEnd);

  const startAtSite    = startDate ? formatInTz(startDate, siteTz) : "";
  const endAtSite      = endDate   ? formatInTz(endDate,   siteTz) : "";
  const startAtIsrael  = startDate ? formatInTz(startDate, ISRAEL_TZ) : "";
  const endAtIsrael    = endDate   ? formatInTz(endDate,   ISRAEL_TZ) : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const fd = new FormData(e.currentTarget);

    const projectId  = selectedProjectId  || (fd.get("projectId")  as string);
    const siteId     = selectedSiteId     || (fd.get("siteId")     as string);
    const mashgiachId = selectedMashgiachId || (fd.get("mashgiachId") as string);

    if (!projectId || !siteId || !mashgiachId) {
      setError("נא למלא את כל השדות החובה");
      setSaving(false);
      return;
    }

    try {
      await createAssignment({
        organizationId: ORG_ID,
        projectId,
        siteId,
        mashgiachId,
        type: fd.get("type") as "ANNUAL" | "SPECIFIC" | "CONTINUOUS" | "INITIAL",
        scheduledAt:  new Date(scheduledAt),
        scheduledEnd: scheduledEnd ? new Date(scheduledEnd) : undefined,
        instructions: (fd.get("instructions") as string) || undefined,
        siteArrangesTravel: fd.get("siteArrangesTravel") === "true",
        travelDetails: (fd.get("travelDetails") as string) || undefined,
      });
      router.push("/scheduling");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "שגיאה בשמירה";
      const prefix = msg.startsWith("CONFLICT:") ? 9 : msg.startsWith("DUPLICATE:") ? 10 : 0;
      setError(prefix ? msg.slice(prefix) : msg);
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
          onChange={(e) => setSelectedProjectId(e.target.value)}
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

        {/* Timezone banner — only when a site with non-Israel TZ is selected */}
        {selectedSite && (
          <div className={`mt-2 rounded-lg px-4 py-3 flex items-start gap-3 ${isLocalSite ? "bg-green-50 border border-green-100" : "bg-amber-50 border border-amber-200"}`}>
            <span className="text-lg mt-0.5">{isLocalSite ? "🇮🇱" : "🌍"}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${isLocalSite ? "text-green-800" : "text-amber-800"}`}>
                {isLocalSite
                  ? "האתר בישראל — שעות זהות לזמן המקומי שלך"
                  : `האתר ב־${selectedSite.timezone} — הזן שעות בזמן מקומי שלך (ישראל)`}
              </p>
              <p className={`text-xs mt-0.5 ${isLocalSite ? "text-green-600" : "text-amber-600"}`}>
                עכשיו באתר: <span className="font-medium">{nowAtSite}</span>
              </p>
            </div>
          </div>
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
      <div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              תאריך ושעת התחלה <span className="text-red-500">*</span>
            </label>
            <input
              name="scheduledAt"
              type="datetime-local"
              required
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">תאריך ושעת סיום</label>
            <input
              name="scheduledEnd"
              type="datetime-local"
              value={scheduledEnd}
              onChange={e => setScheduledEnd(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Timezone conversion — shown when site is not Israel AND dates are filled */}
        {selectedSite && !isLocalSite && (startAtSite || endAtSite) && (
          <div className="mt-2 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 space-y-1.5">
            <p className="text-xs font-semibold text-blue-700 mb-1">🌐 המרת שעות לאזורי זמן</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Start */}
              <div>
                <p className="text-gray-500 mb-0.5">התחלה — בישראל:</p>
                <p className="font-medium text-gray-800">{startAtIsrael || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-0.5">התחלה — באתר ({siteTz.split("/")[1]?.replace("_", " ")}):</p>
                <p className="font-medium text-blue-700">{startAtSite || "—"}</p>
              </div>
              {/* End */}
              {scheduledEnd && (
                <>
                  <div>
                    <p className="text-gray-500 mb-0.5">סיום — בישראל:</p>
                    <p className="font-medium text-gray-800">{endAtIsrael || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-0.5">סיום — באתר ({siteTz.split("/")[1]?.replace("_", " ")}):</p>
                    <p className="font-medium text-blue-700">{endAtSite || "—"}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
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
