"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createMashgiach } from "@/actions/mashgichim";

const ORG_ID = "org_demo";

const ALL_COUNTRIES = [
  "ישראל","ארצות הברית","קנדה","בריטניה","צרפת","גרמניה","איטליה","ספרד",
  "הולנד","בלגיה","שוויץ","אוסטריה","פולין","רוסיה","אוקראינה","בלרוס",
  "ברזיל","ארגנטינה","מקסיקו","קולומביה","צ'ילה","פרו","אורוגוואי","פרגוואי",
  "אוסטרליה","ניו זילנד","יפן","סין","הודו","קוריאה הדרומית","סינגפור","תאילנד",
  "אינדונזיה","מלזיה","פיליפינים","וייטנאם","הונג קונג","טייוואן",
  "דרום אפריקה","מרוקו","תוניסיה","מצרים","אלג'יריה","ניגריה","קניה","אתיופיה","גאנה",
  "לבנון","ירדן","טורקיה","איראן","כווית","איחוד האמירויות","ערב הסעודית","קטר","בחריין","עומאן",
  "שבדיה","נורווגיה","דנמרק","פינלנד","איסלנד",
  "פורטוגל","יוון","הונגריה","צ'כיה","סלובקיה","רומניה","בולגריה",
  "קרואטיה","סרביה","בוסניה","סלובניה","אלבניה","מקדוניה הצפונית",
  "ליטא","לטביה","אסטוניה","גאורגיה","ארמניה","אזרבייג'ן",
  "קזחסטן","אוזבקיסטן","טורקמניסטן","קירגיזסטן","טג'יקיסטן",
  "אירלנד","מלטה","קפריסין","לוקסמבורג",
  "פקיסטן","בנגלדש","סרי לנקה","נפאל","אפגניסטן",
  "סודן","אוגנדה","טנזניה","מוזמביק","זימבבואה","זמביה","אנגולה","קמרון","סנגל","קוט דיוואר",
  "אקוודור","בוליביה","ונצואלה","קוסטה ריקה","פנמה","גואטמלה","הונדורס","אל סלוודור","קובה","דומיניקנית",
  "מולדובה","מונטנגרו","קוסובו","מקדוניה","לוב","ירדן","עיראק","סוריה","ישראל",
];

const ALL_LANGUAGES = [
  "עברית","אנגלית","ערבית","יידיש","לדינו","צרפתית","ספרדית","פורטוגזית",
  "גרמנית","הולנדית","איטלקית","פלמית","קטלנית","גליסית","רוסית","אוקראינית",
  "פולנית","צ'כית","סלובקית","הונגרית","רומנית","בולגרית","קרואטית","סרבית",
  "סלובנית","מקדונית","אלבנית","יוונית","טורקית","פרסית","אורדו","הינדית",
  "בנגלית","מרטהית","פנג'אבית","גוג'ראטית","תמילית","טלוגו","קנדה (שפה)","מלאית",
  "סינית מנדרינית","קנטונזית","יפנית","קוריאנית","ויאטנמית","תאית","אינדונזית","טגלוגית",
  "סווהילי","אמהרית","הוסה","יורובה","איגבו","זולו","שונה","אפריקאנס",
  "פינית","שוודית","נורווגית","דנית","איסלנדית","אסטונית","לטבית","ליטאית",
  "גאורגית","ארמנית","אזרית","קזחית","אוזבקית","טורקמנית",
  "פורטוגזית ברזילאית","ספרדית לטינו-אמריקאית",
];

const LANG_LEVELS = ["שפת אם", "שוטף", "בסיסי"];
const LANG_LEVEL_CODES: Record<string, string> = { "שפת אם": "native", "שוטף": "fluent", "בסיסי": "basic" };
const LANG_LEVEL_LABELS: Record<string, string> = { native: "שפת אם", fluent: "שוטף", basic: "בסיסי" };

const COMMON_REGIONS = ["ישראל","ארה\"ב","אירופה","אמריקה הלטינית","אוסטרליה","אסיה","אפריקה","המזרח התיכון"];

function SearchableTagInput({
  allOptions, selected, onAdd, onRemove, placeholder, tagClass,
}: {
  allOptions: string[];
  selected: string[];
  onAdd: (val: string) => void;
  onRemove: (val: string) => void;
  placeholder: string;
  tagClass: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = allOptions
    .filter(o => !selected.includes(o) && o.includes(query))
    .slice(0, 8);

  function handleSelect(val: string) {
    onAdd(val);
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div>
      <div className="relative mb-2">
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {open && filtered.length > 0 && (
          <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-sm z-20 max-h-44 overflow-y-auto">
            {filtered.map(o => (
              <div key={o} onMouseDown={() => handleSelect(o)}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700 text-right">
                {o}
              </div>
            ))}
          </div>
        )}
        {open && query.length > 0 && filtered.length === 0 && (
          <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-sm z-20 px-3 py-2 text-sm text-gray-400 text-right">
            לא נמצא — בחר מהרשימה
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {selected.map(val => (
          <span key={val} className={`flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-medium ${tagClass}`}>
            {val}
            <button type="button" onClick={() => onRemove(val)} className="hover:opacity-70 ms-0.5">×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

function LanguageTagInput({
  languages, onAdd, onRemove,
}: {
  languages: Record<string, string>;
  onAdd: (lang: string, level: string) => void;
  onRemove: (lang: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState("שוטף");
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = Object.keys(languages);
  const filtered = ALL_LANGUAGES
    .filter(l => !selected.includes(l) && l.includes(query))
    .slice(0, 8);

  function handleSelect(lang: string) {
    onAdd(lang, LANG_LEVEL_CODES[level] ?? "fluent");
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="הקלד שפה לחיפוש..."
            className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {open && filtered.length > 0 && (
            <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-sm z-20 max-h-44 overflow-y-auto">
              {filtered.map(l => (
                <div key={l} onMouseDown={() => handleSelect(l)}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-purple-50 hover:text-purple-700 text-right">
                  {l}
                </div>
              ))}
            </div>
          )}
          {open && query.length > 0 && filtered.length === 0 && (
            <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-sm z-20 px-3 py-2 text-sm text-gray-400 text-right">
              לא נמצא — בחר מהרשימה
            </div>
          )}
        </div>
        <select
          value={level}
          onChange={e => setLevel(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none"
        >
          {LANG_LEVELS.map(l => <option key={l}>{l}</option>)}
        </select>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(languages).map(([lang, lvl]) => (
          <span key={lang} className="flex items-center gap-1 rounded-full bg-purple-50 text-purple-700 px-3 py-0.5 text-xs font-medium">
            {lang} · {LANG_LEVEL_LABELS[lvl] ?? lvl}
            <button type="button" onClick={() => onRemove(lang)} className="hover:opacity-70 ms-0.5">×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

export function NewMashgiachForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [citizenships, setCitizenships] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [languages, setLanguages] = useState<Record<string, string>>({});

  function toggleRegion(r: string) {
    setRegions(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
  }

  function addLanguage(lang: string, level: string) {
    setLanguages(prev => ({ ...prev, [lang]: level }));
  }

  function removeLanguage(lang: string) {
    setLanguages(prev => { const n = { ...prev }; delete n[lang]; return n; });
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
        <SearchableTagInput
          allOptions={ALL_COUNTRIES}
          selected={citizenships}
          onAdd={v => setCitizenships(prev => [...prev, v])}
          onRemove={v => setCitizenships(prev => prev.filter(c => c !== v))}
          placeholder="הקלד מדינה לחיפוש..."
          tagClass="bg-blue-50 text-blue-700"
        />
      </div>

      {/* Active regions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">אזורי פעילות</label>
        <div className="flex flex-wrap gap-2">
          {COMMON_REGIONS.map((r) => (
            <button key={r} type="button" onClick={() => toggleRegion(r)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${regions.includes(r) ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-300 hover:border-green-400"}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">שפות</label>
        <LanguageTagInput
          languages={languages}
          onAdd={addLanguage}
          onRemove={removeLanguage}
        />
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
