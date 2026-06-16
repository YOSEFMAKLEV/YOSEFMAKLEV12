"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCertBody, updateCertBody, createSupervisionLevel, updateSupervisionLevel } from "@/actions/settings";

type CertBody = { id: string; name: string; nameEn: string | null; country: string | null; isActive: boolean };
type Level = { id: string; name: string; nameEn: string | null; color: string | null; isActive: boolean };

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#6b7280", "#0891b2", "#be185d"];

export function SettingsPanel({
  certBodies,
  levels,
  orgId,
}: {
  certBodies: CertBody[];
  levels: Level[];
  orgId: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"certbodies" | "levels">("certbodies");

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

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        {([["certbodies", "גופי כשרות"], ["levels", "רמות השגחה"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Cert Bodies */}
      {tab === "certbodies" && (
        <div className="space-y-4">
          {/* Add form */}
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

          {/* List */}
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
    </div>
  );
}
