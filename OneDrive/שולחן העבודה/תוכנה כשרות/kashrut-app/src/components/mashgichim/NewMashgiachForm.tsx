"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMashgiach } from "@/actions/mashgichim";

const ORG_ID = "org_demo";

const COMMON_CITIZENSHIPS = ["ישראל", "ארה\"ב", "קנדה", "אנגליה", "צרפת", "ארגנטינה", "ברזיל", "אוסטרליה"];
const COMMON_REGIONS = ["ישראל", "ארה\"ב", "אירופה", "אמריקה הלטינית", "אוסטרליה", "אסיה", "אפריקה"];
const LANGUAGES = ["עברית", "אנגלית", "יידיש", "צרפתית", "ספרדית", "פורטוגזית", "גרמנית", "רוסית"];
const LANG_LEVELS = { "שפת אם": "native", "שוטף": "fluent", "בסיסי": "basic" };

export function NewMashgiachForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [citizenships, setCitizenships] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [languages, setLanguages] = useState<Record<string, string>>({});
  const [langInput, setLangInput] = useState({ lang: LANGUAGES[0], level: "שוטף" });

  function toggleItem(arr: string[], setArr: (v: string[]) => void, item: string) {
    setArr(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  }

  function addLanguage() {
    if (langInput.lang) {
      setLanguages({ ...languages, [langInput.lang]: LANG_LEVELS[langInput.level as keyof typeof LANG_LEVELS] ?? "fluent" });
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const m = await createMashgiach({
        organizationId: ORG_ID,
        name: fd.get("name") as string,
        nameEn: (fd.get("nameEn") as string) || undefined,
        phone: (fd.get("phone") as string) || undefined,
        email: (fd.get("email") as string) || undefined,
        city: (fd.get("city") as string) || undefined,
        citizenships,
        activeRegions: regions,
        languages,
        salaryModel: (fd.get("salaryModel") as "HOURLY" | "DAILY" | "MONTHLY" | "COMBINED") || undefined,
        salaryRate: fd.get("salaryRate") ? Number(fd.get("salaryRate")) : undefined,
        expensesType: (fd.get("expensesType") as "NONE" | "FIXED" | "VARIABLE" | "BOTH") || undefined,
        fixedExpenses: fd.get("fixedExpenses") ? Number(fd.get("fixedExpenses")) : undefined,
        notes: (fd.get("notes") as string) || undefined,
      });
      router.push(`/mashgichim/${m.id}`);
    } catch {
      setError("שגיאה בשמירה — נסה שוב");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 space-y-6">

      {/* Basic info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא <span className="text-red-500">*</span></label>
          <input name="name" required placeholder="שם בעברית" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">שם באנגלית</label>
          <input name="nameEn" placeholder="Full name in English" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
          <input name="phone" type="tel" placeholder="050-0000000" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
          <input name="email" type="email" placeholder="email@example.com" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">עיר מגורים</label>
          <input name="city" placeholder="ירושלים / בני ברק / ..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {/* Citizenships */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">אזרחויות</label>
        <div className="flex flex-wrap gap-2">
          {COMMON_CITIZENSHIPS.map((c) => (
            <button key={c} type="button" onClick={() => toggleItem(citizenships, setCitizenships, c)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${citizenships.includes(c) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Active regions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">אזורי פעילות</label>
        <div className="flex flex-wrap gap-2">
          {COMMON_REGIONS.map((r) => (
            <button key={r} type="button" onClick={() => toggleItem(regions, setRegions, r)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${regions.includes(r) ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-300 hover:border-green-400"}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">שפות</label>
        <div className="flex gap-2 mb-2">
          <select value={langInput.lang} onChange={(e) => setLangInput({ ...langInput, lang: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none">
            {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
          </select>
          <select value={langInput.level} onChange={(e) => setLangInput({ ...langInput, level: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none">
            {Object.keys(LANG_LEVELS).map((l) => <option key={l}>{l}</option>)}
          </select>
          <button type="button" onClick={addLanguage} className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200">הוסף</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(languages).map(([lang, level]) => (
            <span key={lang} className="flex items-center gap-1 rounded-full bg-purple-50 text-purple-700 px-3 py-0.5 text-xs">
              {lang} ({level === "native" ? "שפת אם" : level === "fluent" ? "שוטף" : "בסיסי"})
              <button type="button" onClick={() => { const n = { ...languages }; delete n[lang]; setLanguages(n); }} className="text-purple-400 hover:text-purple-700">×</button>
            </span>
          ))}
        </div>
      </div>

      {/* Salary */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
        <h3 className="text-sm font-semibold text-amber-900 mb-3">חוזה שכר</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">מודל שכר</label>
            <select name="salaryModel" defaultValue="HOURLY" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none">
              <option value="HOURLY">שעתי</option>
              <option value="DAILY">יומי</option>
              <option value="MONTHLY">חודשי קבוע</option>
              <option value="COMBINED">משולב</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">תעריף (₪)</label>
            <input name="salaryRate" type="number" min="0" step="0.01" placeholder="0.00" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">סוג הוצאות</label>
            <select name="expensesType" defaultValue="NONE" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none">
              <option value="NONE">ללא</option>
              <option value="FIXED">קבוע</option>
              <option value="VARIABLE">לפי דיווח</option>
              <option value="BOTH">קבוע + דיווח</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">הוצאות קבועות (₪)</label>
            <input name="fixedExpenses" type="number" min="0" step="0.01" placeholder="0.00" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none" />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">הערות</label>
        <textarea name="notes" rows={3} placeholder="הערות כלליות..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {saving ? "שומר..." : "שמור משגיח"}
        </button>
        <a href="/mashgichim" className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 text-center">ביטול</a>
      </div>
    </form>
  );
}
