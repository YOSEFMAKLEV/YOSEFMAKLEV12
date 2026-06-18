"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSite } from "@/actions/sites";

type ContactRow = { tmpId: string; name: string; role: string; phone: string; email: string };

const ORG_ID = "org_demo";

// country code → { Hebrew name, primary timezone }
const COUNTRIES: { code: string; name: string; timezone: string; multiTz?: true }[] = [
  { code: "IL", name: "ישראל",         timezone: "Asia/Jerusalem" },
  { code: "US", name: 'ארה"ב',         timezone: "America/New_York",                  multiTz: true },
  { code: "CA", name: "קנדה",          timezone: "America/Toronto",                   multiTz: true },
  { code: "MX", name: "מקסיקו",        timezone: "America/Mexico_City" },
  { code: "AR", name: "ארגנטינה",      timezone: "America/Argentina/Buenos_Aires" },
  { code: "BR", name: "ברזיל",         timezone: "America/Sao_Paulo",                 multiTz: true },
  { code: "CL", name: "צ'ילה",         timezone: "America/Santiago" },
  { code: "CO", name: "קולומביה",      timezone: "America/Bogota" },
  { code: "UY", name: "אורוגוואי",     timezone: "America/Montevideo" },
  { code: "GB", name: "בריטניה",       timezone: "Europe/London" },
  { code: "IE", name: "אירלנד",        timezone: "Europe/Dublin" },
  { code: "FR", name: "צרפת",          timezone: "Europe/Paris" },
  { code: "BE", name: "בלגיה",         timezone: "Europe/Brussels" },
  { code: "NL", name: "הולנד",         timezone: "Europe/Amsterdam" },
  { code: "DE", name: "גרמניה",        timezone: "Europe/Berlin" },
  { code: "AT", name: "אוסטריה",       timezone: "Europe/Vienna" },
  { code: "CH", name: "שוויץ",         timezone: "Europe/Zurich" },
  { code: "IT", name: "איטליה",        timezone: "Europe/Rome" },
  { code: "ES", name: "ספרד",          timezone: "Europe/Madrid" },
  { code: "PT", name: "פורטוגל",       timezone: "Europe/Lisbon" },
  { code: "PL", name: "פולין",         timezone: "Europe/Warsaw" },
  { code: "CZ", name: "צ'כיה",         timezone: "Europe/Prague" },
  { code: "SK", name: "סלובקיה",       timezone: "Europe/Bratislava" },
  { code: "HU", name: "הונגריה",       timezone: "Europe/Budapest" },
  { code: "RO", name: "רומניה",        timezone: "Europe/Bucharest" },
  { code: "BG", name: "בולגריה",       timezone: "Europe/Sofia" },
  { code: "GR", name: "יוון",          timezone: "Europe/Athens" },
  { code: "HR", name: "קרואטיה",       timezone: "Europe/Zagreb" },
  { code: "RS", name: "סרביה",         timezone: "Europe/Belgrade" },
  { code: "UA", name: "אוקראינה",      timezone: "Europe/Kyiv" },
  { code: "MD", name: "מולדובה",       timezone: "Europe/Chisinau" },
  { code: "RU", name: "רוסיה",         timezone: "Europe/Moscow",                     multiTz: true },
  { code: "TR", name: "טורקיה",        timezone: "Europe/Istanbul" },
  { code: "SE", name: "שוודיה",        timezone: "Europe/Stockholm" },
  { code: "NO", name: "נורווגיה",      timezone: "Europe/Oslo" },
  { code: "DK", name: "דנמרק",         timezone: "Europe/Copenhagen" },
  { code: "FI", name: "פינלנד",        timezone: "Europe/Helsinki" },
  { code: "EE", name: "אסטוניה",       timezone: "Europe/Tallinn" },
  { code: "LV", name: "לטביה",         timezone: "Europe/Riga" },
  { code: "LT", name: "ליטא",          timezone: "Europe/Vilnius" },
  { code: "ZA", name: "דרום אפריקה",   timezone: "Africa/Johannesburg" },
  { code: "EG", name: "מצרים",         timezone: "Africa/Cairo" },
  { code: "MA", name: "מרוקו",         timezone: "Africa/Casablanca" },
  { code: "ET", name: "אתיופיה",       timezone: "Africa/Addis_Ababa" },
  { code: "NG", name: "ניגריה",        timezone: "Africa/Lagos" },
  { code: "KE", name: "קניה",          timezone: "Africa/Nairobi" },
  { code: "CI", name: "חוף השנהב",     timezone: "Africa/Abidjan" },
  { code: "GH", name: "גאנה",          timezone: "Africa/Accra" },
  { code: "TZ", name: "טנזניה",        timezone: "Africa/Dar_es_Salaam" },
  { code: "MG", name: "מדגסקר",        timezone: "Indian/Antananarivo" },
  { code: "MU", name: "מאוריציוס",     timezone: "Indian/Mauritius" },
  { code: "IN", name: "הודו",          timezone: "Asia/Kolkata" },
  { code: "PK", name: "פקיסטן",        timezone: "Asia/Karachi" },
  { code: "BD", name: "בנגלדש",        timezone: "Asia/Dhaka" },
  { code: "LK", name: "סרי לנקה",      timezone: "Asia/Colombo" },
  { code: "CN", name: "סין",           timezone: "Asia/Shanghai" },
  { code: "JP", name: "יפן",           timezone: "Asia/Tokyo" },
  { code: "KR", name: "קוריאה הדרומית",timezone: "Asia/Seoul" },
  { code: "TW", name: "טייוואן",       timezone: "Asia/Taipei" },
  { code: "HK", name: "הונג קונג",     timezone: "Asia/Hong_Kong" },
  { code: "SG", name: "סינגפור",       timezone: "Asia/Singapore" },
  { code: "MY", name: "מלזיה",         timezone: "Asia/Kuala_Lumpur" },
  { code: "PH", name: "פיליפינים",     timezone: "Asia/Manila" },
  { code: "ID", name: "אינדונזיה",     timezone: "Asia/Jakarta",                      multiTz: true },
  { code: "TH", name: "תאילנד",        timezone: "Asia/Bangkok" },
  { code: "VN", name: "וייטנאם",       timezone: "Asia/Ho_Chi_Minh" },
  { code: "KH", name: "קמבודיה",       timezone: "Asia/Phnom_Penh" },
  { code: "MM", name: "מיאנמר",        timezone: "Asia/Rangoon" },
  { code: "NP", name: "נפאל",          timezone: "Asia/Kathmandu" },
  { code: "UZ", name: "אוזבקיסטן",    timezone: "Asia/Tashkent" },
  { code: "KZ", name: "קזחסטן",        timezone: "Asia/Almaty",                       multiTz: true },
  { code: "AZ", name: "אזרבייג'אן",   timezone: "Asia/Baku" },
  { code: "GE", name: "גאורגיה",       timezone: "Asia/Tbilisi" },
  { code: "AM", name: "ארמניה",        timezone: "Asia/Yerevan" },
  { code: "SA", name: "ערב הסעודית",   timezone: "Asia/Riyadh" },
  { code: "AE", name: "איחוד האמירויות",timezone: "Asia/Dubai" },
  { code: "QA", name: "קטאר",          timezone: "Asia/Qatar" },
  { code: "KW", name: "כווית",         timezone: "Asia/Kuwait" },
  { code: "JO", name: "ירדן",          timezone: "Asia/Amman" },
  { code: "LB", name: "לבנון",         timezone: "Asia/Beirut" },
  { code: "AU", name: "אוסטרליה",      timezone: "Australia/Sydney",                  multiTz: true },
  { code: "NZ", name: "ניו זילנד",     timezone: "Pacific/Auckland" },
  { code: "OTHER", name: "אחר",        timezone: "UTC" },
];

// All IANA timezones grouped (for manual override)
const ALL_TIMEZONES = [
  "Africa/Abidjan","Africa/Accra","Africa/Addis_Ababa","Africa/Cairo","Africa/Casablanca",
  "Africa/Dar_es_Salaam","Africa/Johannesburg","Africa/Lagos","Africa/Nairobi",
  "America/Argentina/Buenos_Aires","America/Bogota","America/Chicago","America/Denver",
  "America/Los_Angeles","America/Mexico_City","America/Montevideo","America/New_York",
  "America/Sao_Paulo","America/Santiago","America/Toronto","America/Vancouver",
  "Asia/Almaty","Asia/Amman","Asia/Baku","Asia/Bangkok","Asia/Beirut","Asia/Colombo",
  "Asia/Dhaka","Asia/Dubai","Asia/Ho_Chi_Minh","Asia/Hong_Kong","Asia/Istanbul",
  "Asia/Jakarta","Asia/Jerusalem","Asia/Karachi","Asia/Kathmandu","Asia/Kolkata",
  "Asia/Kuala_Lumpur","Asia/Kuwait","Asia/Manila","Asia/Qatar","Asia/Rangoon",
  "Asia/Riyadh","Asia/Seoul","Asia/Shanghai","Asia/Singapore","Asia/Taipei",
  "Asia/Tashkent","Asia/Tbilisi","Asia/Tehran","Asia/Tokyo","Asia/Yerevan",
  "Atlantic/Reykjavik",
  "Australia/Adelaide","Australia/Brisbane","Australia/Melbourne","Australia/Perth","Australia/Sydney",
  "Europe/Amsterdam","Europe/Athens","Europe/Belgrade","Europe/Berlin","Europe/Bratislava",
  "Europe/Brussels","Europe/Bucharest","Europe/Budapest","Europe/Chisinau","Europe/Copenhagen",
  "Europe/Dublin","Europe/Helsinki","Europe/Istanbul","Europe/Kyiv","Europe/Lisbon",
  "Europe/Ljubljana","Europe/London","Europe/Madrid","Europe/Minsk","Europe/Moscow",
  "Europe/Oslo","Europe/Paris","Europe/Prague","Europe/Riga","Europe/Rome",
  "Europe/Sofia","Europe/Stockholm","Europe/Tallinn","Europe/Vienna","Europe/Vilnius",
  "Europe/Warsaw","Europe/Zagreb","Europe/Zurich",
  "Indian/Antananarivo","Indian/Mauritius",
  "Pacific/Auckland","Pacific/Fiji",
  "UTC",
];

type Client = { id: string; name: string };

export function NewSiteForm({
  clients,
  defaultClientId,
}: {
  clients: Client[];
  defaultClientId?: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [countryCode, setCountryCode] = useState("IL");
  const [timezone, setTimezone] = useState("Asia/Jerusalem");
  const [contacts, setContacts] = useState<ContactRow[]>([
    { tmpId: "c0", name: "", role: "", phone: "", email: "" },
  ]);

  function addContact() {
    setContacts(prev => [...prev, { tmpId: `c${Date.now()}`, name: "", role: "", phone: "", email: "" }]);
  }

  function removeContact(tmpId: string) {
    setContacts(prev => prev.filter(c => c.tmpId !== tmpId));
  }

  function patchContact(tmpId: string, field: keyof Omit<ContactRow, "tmpId">, value: string) {
    setContacts(prev => prev.map(c => c.tmpId === tmpId ? { ...c, [field]: value } : c));
  }

  const selectedCountry = COUNTRIES.find(c => c.code === countryCode);

  function handleCountryChange(code: string) {
    setCountryCode(code);
    const found = COUNTRIES.find(c => c.code === code);
    if (found) setTimezone(found.timezone);
  }

  // current time in selected timezone
  const nowAtSite = timezone
    ? new Intl.DateTimeFormat("he-IL", {
        timeZone: timezone,
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date())
    : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const site = await createSite({
        organizationId: ORG_ID,
        clientId: fd.get("clientId") as string,
        name: fd.get("name") as string,
        nameEn: (fd.get("nameEn") as string) || undefined,
        type: fd.get("type") as "FACTORY" | "RESTAURANT" | "HOTEL" | "BAKERY" | "WAREHOUSE" | "OTHER",
        address: (fd.get("address") as string) || undefined,
        country: countryCode,
        timezone,
        language: (fd.get("language") as string) || undefined,
        internalReport: fd.get("internalReport") === "true",
        rabbinateReport: fd.get("rabbinateReport") === "true",
        contacts: contacts
          .filter(c => c.name.trim())
          .map(c => ({
            name: c.name.trim(),
            role: c.role.trim() || undefined,
            phone: c.phone.trim() || undefined,
            email: c.email.trim() || undefined,
          })),
      });
      router.push(`/sites/${site.id}`);
    } catch {
      setError("שגיאה בשמירה — נסה שוב");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 space-y-5">
      {/* Client */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">לקוח <span className="text-red-500">*</span></label>
        <select
          name="clientId"
          required
          defaultValue={defaultClientId ?? ""}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>בחר לקוח...</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Names */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">שם אתר <span className="text-red-500">*</span></label>
          <input name="name" required placeholder="שם בעברית" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">שם באנגלית</label>
          <input name="nameEn" placeholder="Name in English" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">סוג אתר <span className="text-red-500">*</span></label>
        <select name="type" required defaultValue="FACTORY" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="FACTORY">מפעל ייצור</option>
          <option value="RESTAURANT">מסעדה</option>
          <option value="HOTEL">מלון</option>
          <option value="BAKERY">מאפייה</option>
          <option value="WAREHOUSE">מחסן</option>
          <option value="OTHER">אחר</option>
        </select>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">כתובת</label>
        <input name="address" placeholder="רחוב, עיר" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Country + Timezone (auto) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ארץ <span className="text-red-500">*</span></label>
          <select
            value={countryCode}
            onChange={e => handleCountryChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            אזור זמן <span className="text-red-500">*</span>
            {selectedCountry && !selectedCountry.multiTz && (
              <span className="text-xs text-green-600 ms-1">· זוהה אוטומטית</span>
            )}
            {selectedCountry?.multiTz && (
              <span className="text-xs text-amber-600 ms-1">· כמה אזורי זמן — בחר ידנית</span>
            )}
          </label>
          <select
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ALL_TIMEZONES.map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Live clock */}
      {timezone && (
        <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-2.5 flex items-center gap-2">
          <span className="text-blue-500 text-base">🕐</span>
          <span className="text-sm text-blue-700">
            עכשיו באתר: <span className="font-semibold">{nowAtSite}</span>
          </span>
          <span className="text-xs text-blue-400 ms-auto">{timezone}</span>
        </div>
      )}

      {/* Contacts */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">אנשי קשר</label>
          <button
            type="button"
            onClick={addContact}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            + הוסף איש קשר
          </button>
        </div>
        <div className="space-y-3">
          {contacts.map((c, idx) => (
            <div key={c.tmpId} className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-500">
                  {idx === 0 ? "איש קשר ראשי" : `איש קשר ${idx + 1}`}
                </span>
                {contacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContact(c.tmpId)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    הסר
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    placeholder="שם מלא *"
                    value={c.name}
                    onChange={e => patchContact(c.tmpId, "name", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <input
                    placeholder="תפקיד (מנהל, רכש, מנהל ייצור...)"
                    value={c.role}
                    onChange={e => patchContact(c.tmpId, "role", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="טלפון"
                    value={c.phone}
                    onChange={e => patchContact(c.tmpId, "phone", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="אימייל"
                    value={c.email}
                    onChange={e => patchContact(c.tmpId, "email", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">שפת האתר</label>
        <select name="language" defaultValue="he" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="he">עברית</option>
          <option value="en">English</option>
          <option value="fr">Français</option>
          <option value="es">Español</option>
          <option value="de">Deutsch</option>
          <option value="pt">Português</option>
          <option value="ru">Русский</option>
          <option value="ar">العربية</option>
          <option value="zh">中文</option>
          <option value="ja">日本語</option>
        </select>
      </div>

      {/* Report types */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">סוגי דוחות נדרשים</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="internalReport" value="true" defaultChecked className="rounded accent-blue-600" />
            <span className="text-sm text-gray-700">דו"ח פנימי (לארכיון הסוכנות)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="rabbinateReport" value="true" className="rounded accent-blue-600" />
            <span className="text-sm text-gray-700">דו"ח לרבנות (ממלא תבנית Word)</span>
          </label>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {saving ? "שומר..." : "שמור אתר"}
        </button>
        <a href="/sites" className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 text-center">ביטול</a>
      </div>
    </form>
  );
}
