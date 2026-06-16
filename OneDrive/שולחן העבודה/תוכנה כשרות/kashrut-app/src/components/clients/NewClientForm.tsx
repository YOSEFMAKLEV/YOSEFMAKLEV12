"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/actions/clients";

const ORG_ID = "org_demo";

export function NewClientForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    try {
      const client = await createClient({
        organizationId: ORG_ID,
        name: fd.get("name") as string,
        nameEn: (fd.get("nameEn") as string) || undefined,
        type: fd.get("type") as "IMPORTER" | "BUSINESS" | "BOTH",
        vatNumber: (fd.get("vatNumber") as string) || undefined,
        contactName: (fd.get("contactName") as string) || undefined,
        phone: (fd.get("phone") as string) || undefined,
        email: (fd.get("email") as string) || undefined,
        address: (fd.get("address") as string) || undefined,
        certRelease: fd.get("certRelease") as "IMMEDIATE" | "AFTER_PAYMENT",
        requiresQuote: fd.get("requiresQuote") === "true",
      });
      router.push(`/clients/${client.id}`);
    } catch {
      setError("שגיאה בשמירה — נסה שוב");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 space-y-5">
      {/* Name */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">שם לקוח <span className="text-red-500">*</span></label>
          <input
            name="name"
            required
            placeholder="שם בעברית"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">שם באנגלית</label>
          <input
            name="nameEn"
            placeholder="Name in English"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Type + VAT */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">סוג לקוח <span className="text-red-500">*</span></label>
          <select
            name="type"
            required
            defaultValue="IMPORTER"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="IMPORTER">יבואן</option>
            <option value="BUSINESS">בית עסק</option>
            <option value="BOTH">יבואן + בית עסק</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ח.פ / ע.מ</label>
          <input
            name="vatNumber"
            placeholder="מספר עוסק / חברה"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">איש קשר</label>
          <input
            name="contactName"
            placeholder="שם איש קשר"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
          <input
            name="phone"
            type="tel"
            placeholder="050-0000000"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
        <input
          name="email"
          type="email"
          placeholder="email@example.com"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">כתובת</label>
        <input
          name="address"
          placeholder="רחוב, עיר, מיקוד"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Certificate release */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">הגדרות תעודה</h3>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 block mb-1">שחרור תעודה</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="certRelease"
                value="IMMEDIATE"
                defaultChecked
                className="accent-blue-600"
              />
              <span className="text-sm text-gray-700">מיידי — שחרור תעודה אוטומטי לאחר אישור</span>
            </label>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="certRelease"
                value="AFTER_PAYMENT"
                className="accent-blue-600"
              />
              <span className="text-sm text-gray-700">לאחר תשלום — תעודה נשמרת עד לאישור תשלום</span>
            </label>
          </div>
        </div>

        <div className="mt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="requiresQuote"
              value="true"
              className="rounded accent-blue-600"
            />
            <span className="text-sm text-gray-700">מצריך הצעת מחיר לפני פתיחת פרויקט</span>
          </label>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "שומר..." : "שמור לקוח"}
        </button>
        <a
          href="/clients"
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 text-center"
        >
          ביטול
        </a>
      </div>
    </form>
  );
}
