"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSite } from "@/actions/sites";

const ORG_ID = "org_demo";

const TIMEZONES = [
  "Asia/Jerusalem",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
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
        country: fd.get("country") as string,
        timezone: fd.get("timezone") as string,
        contactName: (fd.get("contactName") as string) || undefined,
        phone: (fd.get("phone") as string) || undefined,
        email: (fd.get("email") as string) || undefined,
        language: (fd.get("language") as string) || undefined,
        internalReport: fd.get("internalReport") === "true",
        rabbinateReport: fd.get("rabbinateReport") === "true",
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

      {/* Address + Country */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">כתובת</label>
        <input name="address" placeholder="רחוב, עיר, מדינה" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ארץ <span className="text-red-500">*</span></label>
          <input name="country" required placeholder="ישראל / USA / France..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">אזור זמן <span className="text-red-500">*</span></label>
          <select name="timezone" required defaultValue="Asia/Jerusalem" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">איש קשר</label>
          <input name="contactName" placeholder="שם איש קשר במפעל" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
          <input name="phone" type="tel" placeholder="+1-212-000-0000" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
          <input name="email" type="email" placeholder="factory@example.com" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">שפת האתר</label>
          <select name="language" defaultValue="he" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="he">עברית</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
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
