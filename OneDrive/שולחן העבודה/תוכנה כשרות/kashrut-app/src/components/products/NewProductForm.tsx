"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/actions/products";

const ORG_ID = "org_demo";

type Site = { id: string; name: string; client: { id: string; name: string } };

export function NewProductForm({
  sites,
  defaultSiteId,
  defaultClientId,
}: {
  sites: Site[];
  defaultSiteId?: string;
  defaultClientId?: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedSiteId, setSelectedSiteId] = useState(defaultSiteId ?? "");

  const selectedSite = sites.find((s) => s.id === selectedSiteId);
  const clientId = selectedSite?.client.id ?? defaultClientId ?? "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedSiteId || !clientId) { setError("בחר מפעל"); return; }
    setSaving(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const product = await createProduct({
        organizationId: ORG_ID,
        siteId: selectedSiteId,
        clientId,
        name: fd.get("name") as string,
        nameEn: (fd.get("nameEn") as string) || undefined,
        category: (fd.get("category") as string) || undefined,
      });
      router.push(`/products/${product.id}`);
    } catch {
      setError("שגיאה בשמירה — נסה שוב");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 space-y-5">
      {/* Site */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">מפעל / אתר <span className="text-red-500">*</span></label>
        <select
          required
          value={selectedSiteId}
          onChange={(e) => setSelectedSiteId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>בחר מפעל...</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>{s.name} — {s.client.name}</option>
          ))}
        </select>
      </div>

      {/* Names */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">שם מוצר <span className="text-red-500">*</span></label>
          <input name="name" required placeholder="שם בעברית" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">שם באנגלית</label>
          <input name="nameEn" placeholder="Product name in English" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
        <input name="category" placeholder="לדוגמה: שוקולד, גבינה, לחם..." className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {selectedSite && (
        <div className="rounded-lg bg-gray-50 border px-4 py-3 text-sm text-gray-600">
          לקוח: <span className="font-medium">{selectedSite.client.name}</span>
        </div>
      )}

      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {saving ? "שומר..." : "שמור מוצר"}
        </button>
        <a href="/products" className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 text-center">ביטול</a>
      </div>
    </form>
  );
}
