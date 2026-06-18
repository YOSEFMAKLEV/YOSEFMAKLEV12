"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const SALARY_LABELS: Record<string, string> = {
  HOURLY: "שעתי", DAILY: "יומי", MONTHLY: "חודשי", COMBINED: "משולב",
};
const LANG_LEVEL_LABELS: Record<string, string> = {
  native: "שפת אם", fluent: "שוטף", basic: "בסיסי",
};

function countryName(code: string): string {
  if (code.length <= 3 && code === code.toUpperCase()) {
    try { return new Intl.DisplayNames(["he"], { type: "region" }).of(code) ?? code; } catch { return code; }
  }
  return code;
}

type Mashgiach = {
  id: string;
  name: string;
  nameEn: string | null;
  phone: string | null;
  city: string | null;
  isActive: boolean;
  salaryModel: string | null;
  salaryRate: number | null;
  citizenships: string[];
  activeRegions: string[];
  languages: Record<string, string>;
  levels: { levelId: string; name: string; color: string | null }[];
  assignmentsCount: number;
};

export function MashgichimList({ mashgichim }: { mashgichim: Mashgiach[] }) {
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const allLanguages = useMemo(() => {
    const set = new Set<string>();
    mashgichim.forEach((m) => Object.keys(m.languages).forEach((l) => set.add(l)));
    return Array.from(set).sort();
  }, [mashgichim]);

  const filtered = useMemo(() => {
    return mashgichim.filter((m) => {
      const matchSearch = !search ||
        m.name.includes(search) ||
        (m.nameEn?.toLowerCase().includes(search.toLowerCase())) ||
        (m.phone?.includes(search)) ||
        (m.city?.includes(search));
      const matchLang = !langFilter || langFilter in m.languages;
      const matchStatus = !statusFilter ||
        (statusFilter === "active" ? m.isActive : !m.isActive);
      return matchSearch && matchLang && matchStatus;
    });
  }, [mashgichim, search, langFilter, statusFilter]);

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-44">
          <span className="absolute inset-y-0 start-3 flex items-center text-gray-400 pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
              <path d="M6.5 1a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zm-7 5.5a7 7 0 1 1 12.469 4.348l3.469 3.468a.75.75 0 1 1-1.06 1.061l-3.47-3.468A7 7 0 0 1-.5 6.5z" fill="currentColor"/>
            </svg>
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם, טלפון, עיר..."
            className="w-full rounded-lg border border-gray-200 bg-white ps-9 pe-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={langFilter}
          onChange={(e) => setLangFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">כל השפות</option>
          {allLanguages.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">כל הסטטוסים</option>
          <option value="active">פעיל</option>
          <option value="inactive">לא פעיל</option>
        </select>

        {(search || langFilter || statusFilter) && (
          <button
            onClick={() => { setSearch(""); setLangFilter(""); setStatusFilter(""); }}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            נקה סינון
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400 mb-3">{filtered.length} מתוך {mashgichim.length} משגיחים</p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-3 rounded-xl border bg-white p-12 text-center text-gray-400">
            {mashgichim.length === 0
              ? <><span>אין משגיחים — </span><Link href="/mashgichim/new" className="text-blue-600 hover:underline">הוסף את הראשון</Link></>
              : "אין תוצאות לסינון זה"}
          </div>
        )}
        {filtered.map((m) => (
          <Link
            key={m.id}
            href={`/mashgichim/${m.id}`}
            className="rounded-xl border bg-white p-5 hover:shadow-md transition-shadow block"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {m.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 leading-tight">{m.name}</p>
                  {m.nameEn && <p className="text-xs text-gray-400 leading-tight">{m.nameEn}</p>}
                </div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0 ${m.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {m.isActive ? "פעיל" : "לא פעיל"}
              </span>
            </div>

            {/* Contact */}
            <div className="space-y-1 text-xs text-gray-500 mb-3">
              {m.phone && <p>📞 {m.phone}</p>}
              {m.city && <p>📍 {m.city}</p>}
              {m.salaryModel && (
                <p>💰 {SALARY_LABELS[m.salaryModel]}{m.salaryRate ? ` · ₪${m.salaryRate}` : ""}</p>
              )}
            </div>

            {/* Languages */}
            {Object.keys(m.languages).length > 0 && (
              <div className="mb-2.5">
                <p className="text-[10px] text-gray-400 mb-1 font-medium uppercase tracking-wide">שפות</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(m.languages).map(([lang, level]) => (
                    <span
                      key={lang}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        langFilter === lang
                          ? "bg-purple-600 text-white"
                          : "bg-purple-50 text-purple-700"
                      }`}
                    >
                      {lang}
                      {level && <span className="opacity-70"> · {LANG_LEVEL_LABELS[level] ?? level}</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Citizenships */}
            {m.citizenships.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2.5">
                {m.citizenships.map((c) => (
                  <span key={c} className="rounded-full bg-blue-50 text-blue-600 px-2 py-0.5 text-xs">
                    {countryName(c)}
                  </span>
                ))}
              </div>
            )}

            {/* Levels */}
            {m.levels.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2.5">
                {m.levels.map((l) => (
                  <span
                    key={l.levelId}
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: l.color ? `${l.color}20` : "#f3f4f6", color: l.color ?? "#374151" }}
                  >
                    {l.name}
                  </span>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-400 mt-1">{m.assignmentsCount} שיבוצים</p>
          </Link>
        ))}
      </div>
    </>
  );
}
