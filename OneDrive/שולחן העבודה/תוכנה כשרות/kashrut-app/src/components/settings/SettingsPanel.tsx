"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCertBody, updateCertBody, createSupervisionLevel, updateSupervisionLevel } from "@/actions/settings";

type CertBody = { id: string; name: string; nameEn: string | null; country: string | null; isActive: boolean };
type Level = { id: string; name: string; nameEn: string | null; color: string | null; isActive: boolean };
type LogEntry = {
  id: string;
  action: string;
  entityType: string;
  description: string;
  createdAt: Date;
  user: { name: string; role: string } | null;
  client: { name: string } | null;
  site: { name: string } | null;
};

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#6b7280", "#0891b2", "#be185d"];

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  login:               { label: "כניסה",        color: "bg-green-100 text-green-700" },
  created:             { label: "יצירה",         color: "bg-blue-100 text-blue-700" },
  updated:             { label: "עדכון",         color: "bg-amber-100 text-amber-700" },
  deleted:             { label: "מחיקה",         color: "bg-red-100 text-red-700" },
  certificate_issued:  { label: "הפקת תעודה",    color: "bg-purple-100 text-purple-700" },
  certificate_sent:    { label: "שליחת תעודה",   color: "bg-teal-100 text-teal-700" },
  certificate_released:{ label: "שחרור תעודה",   color: "bg-teal-100 text-teal-700" },
  note:                { label: "הערה",          color: "bg-gray-100 text-gray-600" },
};

function formatDateTime(d: Date) {
  return new Intl.DateTimeFormat("he-IL", { dateStyle: "short", timeStyle: "short" }).format(new Date(d));
}

export function SettingsPanel({
  certBodies,
  levels,
  orgId,
  activityLogs = [],
}: {
  certBodies: CertBody[];
  levels: Level[];
  orgId: string;
  activityLogs?: LogEntry[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"certbodies" | "levels" | "log">("certbodies");
  const [logFilter, setLogFilter] = useState("");

  // Cert body form state
  const [cbName, setCbName] = useState("");
  const [cbNameEn, setCbNameEn] = useState("");
  const [cbCountry, setCbCountry] = useState("");
  const [savingCb, setSavingCb] = useState(false);

  // Level form state
  const [lvlName, setLvlName] = useState("");
  const [lvlNameEn, setLvlNameEn] = useState("");
  const [lvlColor, setLvlColor] = useState(COLORS[0]);
  const [savingLvl, setSavingLvl] = useState(false);

  async function addCertBody() {
    if (!cbName.trim()) return;
    setSavingCb(true);
    await createCertBody({ organizationId: orgId, name: cbName, nameEn: cbNameEn || undefined, country: cbCountry || undefined });
    setCbName(""); setCbNameEn(""); setCbCountry("");
    router.refresh();
    setSavingCb(false);
  }

  async function toggleCertBody(id: string, isActive: boolean) {
    await updateCertBody(id, { isActive: !isActive });
    router.refresh();
  }

  async function addLevel() {
    if (!lvlName.trim()) return;
    setSavingLvl(true);
    await createSupervisionLevel({ organizationId: orgId, name: lvlName, nameEn: lvlNameEn || undefined, color: lvlColor });
    setLvlName(""); setLvlNameEn("");
    router.refresh();
    setSavingLvl(false);
  }

  async function toggleLevel(id: string, isActive: boolean) {
    await updateSupervisionLevel(id, { isActive: !isActive });
    router.refresh();
  }

  const filteredLogs = logFilter
    ? activityLogs.filter(l => l.action === logFilter)
    : activityLogs;

  const uniqueActions = [...new Set(activityLogs.map(l => l.action))];

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        {([
          ["certbodies", "גופי כשרות"],
          ["levels", "רמות השגחה"],
          ["log", `לוג פעילות${activityLogs.length > 0 ? ` (${activityLogs.length})` : ""}`],
        ] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Cert Bodies */}
      {tab === "certbodies" && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold text-gray-900 mb-4">הוסף גוף כשרות</h2>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <input value={cbName} onChange={(e) => setCbName(e.target.value)} placeholder="שם (עברית) *" className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input value={cbNameEn} onChange={(e) => setCbNameEn(e.target.value)} placeholder="Name (English)" className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input value={cbCountry} onChange={(e) => setCbCountry(e.target.value)} placeholder="ארץ" className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={addCertBody} disabled={!cbName.trim() || savingCb} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {savingCb ? "שומר..." : "+ הוסף"}
            </button>
          </div>

          <div className="rounded-xl border bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">שם</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">אנגלית</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">ארץ</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">סטטוס</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {certBodies.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">אין גופי כשרות עדיין</td></tr>
                )}
                {certBodies.map((cb) => (
                  <tr key={cb.id} className={cb.isActive ? "" : "opacity-50"}>
                    <td className="px-4 py-3 font-medium">{cb.name}</td>
                    <td className="px-4 py-3 text-gray-500">{cb.nameEn || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{cb.country || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cb.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {cb.isActive ? "פעיל" : "לא פעיל"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleCertBody(cb.id, cb.isActive)} className="text-xs text-gray-400 hover:text-red-500">
                        {cb.isActive ? "🗑 בטל" : "שחזר"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Supervision Levels */}
      {tab === "levels" && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold text-gray-900 mb-4">הוסף רמת השגחה</h2>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <input value={lvlName} onChange={(e) => setLvlName(e.target.value)} placeholder="שם (עברית) *" className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input value={lvlNameEn} onChange={(e) => setLvlNameEn(e.target.value)} placeholder="Name (English)" className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="flex gap-2 items-center">
                {COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setLvlColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${lvlColor === c ? "border-gray-900 scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <button onClick={addLevel} disabled={!lvlName.trim() || savingLvl} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {savingLvl ? "שומר..." : "+ הוסף"}
            </button>
          </div>

          <div className="rounded-xl border bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">שם</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">אנגלית</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">צבע</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {levels.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">אין רמות עדיין</td></tr>
                )}
                {levels.map((l) => (
                  <tr key={l.id} className={l.isActive ? "" : "opacity-50"}>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-3 py-1 text-xs font-medium"
                        style={{ backgroundColor: l.color ? `${l.color}20` : "#f3f4f6", color: l.color ?? "#374151" }}>
                        {l.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{l.nameEn || "—"}</td>
                    <td className="px-4 py-3">
                      {l.color && <span className="w-5 h-5 rounded-full inline-block" style={{ backgroundColor: l.color }} />}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleLevel(l.id, l.isActive)} className="text-xs text-gray-400 hover:text-red-500">
                        {l.isActive ? "🗑 בטל" : "שחזר"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activity Log */}
      {tab === "log" && (
        <div className="space-y-4">
          {/* Filter bar */}
          <div className="flex items-center gap-3">
            <select
              value={logFilter}
              onChange={e => setLogFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">כל הפעולות</option>
              {uniqueActions.map(a => (
                <option key={a} value={a}>{ACTION_LABELS[a]?.label ?? a}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400">{filteredLogs.length} רשומות</p>
          </div>

          <div className="rounded-xl border bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">תאריך ושעה</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">פעולה</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">תיאור</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">משתמש</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">ישות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">אין רשומות לוג</td></tr>
                )}
                {filteredLogs.map(log => {
                  const actionInfo = ACTION_LABELS[log.action];
                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${actionInfo?.color ?? "bg-gray-100 text-gray-600"}`}>
                          {actionInfo?.label ?? log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-xs truncate" title={log.description}>{log.description}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {log.user ? (
                          <div>
                            <p className="font-medium text-gray-700">{log.user.name}</p>
                            <p className="text-gray-400">{log.user.role}</p>
                          </div>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {log.client?.name ?? log.site?.name ?? log.entityType ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
