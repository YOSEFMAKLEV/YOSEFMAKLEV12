"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertProjectLineItem, deleteProjectLineItem } from "@/actions/billing";

type PriceItem = {
  id: string; name: string; unitLabel: string | null; price: number; currency: string;
};
type LineItem = {
  id: string; description: string; quantity: number; unitPrice: number;
  currency: string; notes: string | null; priceItemId: string | null;
  priceItem: { id: string; name: string; unitLabel: string | null } | null;
};

const CURRENCY_SYMBOL: Record<string, string> = { ILS: "₪", USD: "$", EUR: "€", GBP: "£" };

type EditDraft = {
  id?: string;
  priceItemId?: string | null;
  description: string;
  quantity: string;
  unitPrice: string;
  currency: string;
  notes: string;
};

function emptyDraft(): EditDraft {
  return { description: "", quantity: "1", unitPrice: "", currency: "USD", notes: "" };
}

export function ProjectBillingTab({
  projectId,
  priceItems,
  lineItems,
}: {
  projectId: string;
  priceItems: PriceItem[];
  lineItems: LineItem[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const total = lineItems.reduce((sum, li) => {
    if (li.currency === "ILS") return sum + li.quantity * li.unitPrice;
    return sum;
  }, 0);

  function openAddFromPriceItem(pi: PriceItem) {
    setDraft({
      priceItemId: pi.id,
      description: pi.name,
      quantity: "1",
      unitPrice: String(pi.price),
      currency: pi.currency,
      notes: "",
    });
  }

  function openEdit(li: LineItem) {
    setDraft({
      id: li.id,
      priceItemId: li.priceItemId,
      description: li.description,
      quantity: String(li.quantity),
      unitPrice: String(li.unitPrice),
      currency: li.currency,
      notes: li.notes ?? "",
    });
  }

  async function handleSave() {
    if (!draft) return;
    const qty = parseFloat(draft.quantity);
    const price = parseFloat(draft.unitPrice);
    if (!draft.description.trim() || isNaN(qty) || isNaN(price)) return;
    setSaving(true);
    await upsertProjectLineItem({
      id: draft.id,
      projectId,
      priceItemId: draft.priceItemId ?? null,
      description: draft.description.trim(),
      quantity: qty,
      unitPrice: price,
      currency: draft.currency as never,
      notes: draft.notes.trim() || undefined,
    });
    setDraft(null);
    setSaving(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await deleteProjectLineItem(id, projectId);
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {/* Rate card quick-add */}
      {priceItems.length > 0 && (
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs font-semibold text-gray-500 mb-3">כרטיס תעריפים — הוסף שורה</p>
          <div className="flex flex-wrap gap-2">
            {priceItems.map((pi) => (
              <button
                key={pi.id}
                onClick={() => openAddFromPriceItem(pi)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <span className="font-medium">{pi.name}</span>
                <span className="text-blue-400 text-xs">
                  {CURRENCY_SYMBOL[pi.currency] ?? pi.currency}{pi.price.toLocaleString()}
                  {pi.unitLabel ? ` / ${pi.unitLabel}` : ""}
                </span>
              </button>
            ))}
            <button
              onClick={() => setDraft(emptyDraft())}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
            >
              + הוסף ידני
            </button>
          </div>
        </div>
      )}

      {priceItems.length === 0 && !draft && (
        <div className="text-center py-4">
          <button
            onClick={() => setDraft(emptyDraft())}
            className="rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
          >
            + הוסף שורת חיוב
          </button>
        </div>
      )}

      {/* Add/edit form */}
      {draft && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-semibold text-blue-700 mb-3">{draft.id ? "עריכת שורה" : "שורה חדשה"}</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">תיאור</label>
              <input
                autoFocus
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="תיאור השירות"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">כמות</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={draft.quantity}
                onChange={(e) => setDraft({ ...draft, quantity: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">מחיר יחידה</label>
              <div className="flex gap-1">
                <select
                  value={draft.currency}
                  onChange={(e) => setDraft({ ...draft, currency: e.target.value })}
                  className="rounded-lg border border-gray-200 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {["ILS", "USD", "EUR", "GBP"].map((c) => (
                    <option key={c} value={c}>{CURRENCY_SYMBOL[c]} {c}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.unitPrice}
                  onChange={(e) => setDraft({ ...draft, unitPrice: e.target.value })}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">הערות</label>
              <input
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                placeholder="הערות אופציונליות..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          {draft.quantity && draft.unitPrice && (
            <p className="text-sm text-blue-700 mb-3 font-medium">
              סה״כ: {CURRENCY_SYMBOL[draft.currency] ?? draft.currency}
              {(parseFloat(draft.quantity || "0") * parseFloat(draft.unitPrice || "0")).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !draft.description.trim() || !draft.quantity || !draft.unitPrice}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40"
            >
              {saving ? "שומר..." : "שמור"}
            </button>
            <button
              onClick={() => setDraft(null)}
              disabled={saving}
              className="rounded-lg border border-gray-200 bg-white px-4 py-1.5 text-sm text-gray-500 hover:bg-gray-50"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* Line items table */}
      {lineItems.length > 0 && (
        <div className="rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-start px-4 py-3 font-medium text-gray-600">תיאור</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">כמות</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">מחיר יחידה</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">סה״כ</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lineItems.map((li) => (
                <tr key={li.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{li.description}</p>
                    {li.notes && <p className="text-xs text-gray-400">{li.notes}</p>}
                    {li.priceItem && (
                      <p className="text-xs text-blue-500 mt-0.5">⟵ {li.priceItem.name}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{li.quantity}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {CURRENCY_SYMBOL[li.currency] ?? li.currency}{li.unitPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {CURRENCY_SYMBOL[li.currency] ?? li.currency}
                    {(li.quantity * li.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(li)}
                        className="text-xs text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        עריכה
                      </button>
                      <button
                        onClick={() => handleDelete(li.id)}
                        disabled={deleting === li.id}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                      >
                        {deleting === li.id ? "מוחק..." : "מחק"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {total > 0 && (
              <tfoot className="bg-gray-50 border-t">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-sm font-medium text-gray-600 text-end">
                    סה״כ ₪:
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">
                    ₪{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {lineItems.length === 0 && !draft && priceItems.length > 0 && (
        <p className="text-center text-sm text-gray-400 py-4">אין שורות חיוב — לחץ על תעריף למעלה להוספה</p>
      )}
    </div>
  );
}
