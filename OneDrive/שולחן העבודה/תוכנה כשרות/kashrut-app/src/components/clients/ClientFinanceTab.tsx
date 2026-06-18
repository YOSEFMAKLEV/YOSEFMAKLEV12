"use client";

import { useState } from "react";
import { updateClientBilling, upsertClientPriceItem, deleteClientPriceItem } from "@/actions/billing";

type PriceItem = {
  id: string;
  name: string;
  unitLabel: string | null;
  price: number;
  currency: string;
  order: number;
};

type Dealer = { id: string; name: string };

type Client = {
  id: string;
  billingSource: string;
  agentCommissionDealerId: string | null;
  agentCommissionType: string;
  agentCommissionValue: number | null;
  annualFee: number | null;
  annualFeeCurrency: string;
  billingNotes: string | null;
  priceItems: PriceItem[];
};

const BILLING_SOURCE_LABELS: Record<string, string> = {
  IMPORTER: "מהלקוח (יבואן) ישיר",
  AGENT: "מהסוכן",
  FACTORY: "מהמפעל ישיר",
};

const COMMISSION_LABELS: Record<string, string> = {
  NONE: "אין עמלת סוכן",
  PERCENTAGE: "אחוז מהחשבון",
  FIXED: "סכום קבוע",
};

const CURRENCIES = ["ILS", "USD", "EUR", "GBP"] as const;
const CURRENCY_SYMBOL: Record<string, string> = { ILS: "₪", USD: "$", EUR: "€", GBP: "£" };

const EMPTY_ITEM = { name: "", unitLabel: "", price: "", currency: "USD" as const };

export function ClientFinanceTab({ client, dealers }: { client: Client; dealers: Dealer[] }) {
  // ── Billing settings state ────────────────────────────────────────────────
  const [billingSource, setBillingSource] = useState(client.billingSource);
  const [commType, setCommType] = useState(client.agentCommissionType);
  const [commDealerId, setCommDealerId] = useState(client.agentCommissionDealerId ?? "");
  const [commValue, setCommValue] = useState(client.agentCommissionValue?.toString() ?? "");
  const [annualFee, setAnnualFee] = useState(client.annualFee?.toString() ?? "");
  const [annualCurrency, setAnnualCurrency] = useState(client.annualFeeCurrency);
  const [billingNotes, setBillingNotes] = useState(client.billingNotes ?? "");
  const [savingBilling, setSavingBilling] = useState(false);
  const [billingDirty, setBillingDirty] = useState(false);

  // ── Price items state ────────────────────────────────────────────────────
  const [items, setItems] = useState<PriceItem[]>(client.priceItems);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState(EMPTY_ITEM);
  const [savingItem, setSavingItem] = useState(false);

  // ── Billing save ─────────────────────────────────────────────────────────
  async function saveBilling() {
    setSavingBilling(true);
    await updateClientBilling(client.id, {
      billingSource: billingSource as any,
      agentCommissionType: commType as any,
      agentCommissionDealerId: commDealerId || null,
      agentCommissionValue: commValue ? parseFloat(commValue) : null,
      annualFee: annualFee ? parseFloat(annualFee) : null,
      annualFeeCurrency: annualCurrency as any,
      billingNotes: billingNotes || null,
    });
    setBillingDirty(false);
    setSavingBilling(false);
  }

  function markDirty() { setBillingDirty(true); }

  // ── Price item actions ────────────────────────────────────────────────────
  function startEdit(item: PriceItem) {
    setEditItemId(item.id);
    setItemForm({ name: item.name, unitLabel: item.unitLabel ?? "", price: item.price.toString(), currency: item.currency as any });
    setShowAddItem(false);
  }

  function cancelItemForm() {
    setShowAddItem(false);
    setEditItemId(null);
    setItemForm(EMPTY_ITEM);
  }

  async function saveItem() {
    if (!itemForm.name.trim() || !itemForm.price) return;
    setSavingItem(true);
    const saved = await upsertClientPriceItem({
      id: editItemId ?? undefined,
      clientId: client.id,
      name: itemForm.name.trim(),
      unitLabel: itemForm.unitLabel.trim() || undefined,
      price: parseFloat(itemForm.price),
      currency: itemForm.currency as any,
      order: editItemId ? items.find(i => i.id === editItemId)?.order ?? 0 : items.length,
    });
    if (editItemId) {
      setItems(prev => prev.map(i => i.id === editItemId ? { ...i, ...saved, unitLabel: saved.unitLabel ?? null } : i));
    } else {
      setItems(prev => [...prev, { ...saved, unitLabel: saved.unitLabel ?? null }]);
    }
    cancelItemForm();
    setSavingItem(false);
  }

  async function removeItem(id: string) {
    if (!confirm("למחוק שורה זו?")) return;
    await deleteClientPriceItem(id, client.id);
    setItems(prev => prev.filter(i => i.id !== id));
  }

  return (
    <div className="space-y-5">

      {/* ── Section 1: Billing settings ── */}
      <div className="rounded-xl border bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 text-sm">הגדרות גבייה</h3>
          {billingDirty && (
            <button
              onClick={saveBilling}
              disabled={savingBilling}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {savingBilling ? "שומר..." : "שמור שינויים"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* Billing source */}
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1.5">גובה מ</label>
            <div className="flex gap-2">
              {(["IMPORTER", "AGENT", "FACTORY"] as const).map(src => (
                <button
                  key={src}
                  type="button"
                  onClick={() => { setBillingSource(src); markDirty(); }}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${billingSource === src ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                >
                  {BILLING_SOURCE_LABELS[src]}
                </button>
              ))}
            </div>
          </div>

          {/* Annual fee */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">דמי ניהול שנתיים</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={annualFee}
                onChange={e => { setAnnualFee(e.target.value); markDirty(); }}
                placeholder="ריק = אין"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={annualCurrency}
                onChange={e => { setAnnualCurrency(e.target.value); markDirty(); }}
                className="rounded-lg border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CURRENCIES.map(c => <option key={c} value={c}>{CURRENCY_SYMBOL[c]} {c}</option>)}
              </select>
            </div>
          </div>

          {/* Agent commission */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">עמלת סוכן</label>
            <select
              value={commType}
              onChange={e => { setCommType(e.target.value); markDirty(); }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(COMMISSION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {commType !== "NONE" && (
            <>
              <div>
                <label className="block text-xs text-gray-500 mb-1">סוכן לעמלה</label>
                <select
                  value={commDealerId}
                  onChange={e => { setCommDealerId(e.target.value); markDirty(); }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— בחר סוכן —</option>
                  {dealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {commType === "PERCENTAGE" ? "אחוז (%)" : "סכום קבוע"}
                </label>
                <input
                  type="number"
                  value={commValue}
                  onChange={e => { setCommValue(e.target.value); markDirty(); }}
                  placeholder={commType === "PERCENTAGE" ? "לדוגמה: 15" : "סכום"}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* Billing notes */}
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1">הערות כספיות</label>
            <textarea
              value={billingNotes}
              onChange={e => { setBillingNotes(e.target.value); markDirty(); }}
              rows={2}
              placeholder="הסכמים מיוחדים, תנאי תשלום..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* ── Section 2: Price items (rate card) ── */}
      <div className="rounded-xl border bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 text-sm">כרטיס תעריפים</h3>
          {!showAddItem && !editItemId && (
            <button
              onClick={() => { setShowAddItem(true); setItemForm(EMPTY_ITEM); }}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              + הוסף שירות
            </button>
          )}
        </div>

        {/* Item form */}
        {(showAddItem || editItemId) && (
          <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-medium text-blue-700 mb-3">{editItemId ? "עריכת שירות" : "שירות חדש"}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">שם השירות *</label>
                <input
                  autoFocus
                  value={itemForm.name}
                  onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="לדוגמה: יום עבודה, טיסה, כלכלה..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">מחיר ליחידה *</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={itemForm.price}
                    onChange={e => setItemForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="0"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={itemForm.currency}
                    onChange={e => setItemForm(f => ({ ...f, currency: e.target.value as any }))}
                    className="rounded-lg border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CURRENCIES.map(c => <option key={c} value={c}>{CURRENCY_SYMBOL[c]} {c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">יחידת מידה</label>
                <input
                  value={itemForm.unitLabel}
                  onChange={e => setItemForm(f => ({ ...f, unitLabel: e.target.value }))}
                  placeholder="ליום / לטיסה / לשנה..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={saveItem}
                disabled={savingItem || !itemForm.name.trim() || !itemForm.price}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {savingItem ? "שומר..." : "שמור"}
              </button>
              <button onClick={cancelItemForm} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
                ביטול
              </button>
            </div>
          </div>
        )}

        {/* Items list */}
        {items.length === 0 && !showAddItem ? (
          <p className="text-sm text-gray-400 text-center py-6">
            אין תעריפים עדיין — לחץ "+ הוסף שירות"
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-3 py-3">
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                  {item.unitLabel && <span className="text-xs text-gray-400 ms-1">/ {item.unitLabel}</span>}
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {CURRENCY_SYMBOL[item.currency]}{item.price.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400">{item.currency}</span>
                <button
                  onClick={() => startEdit(item)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  עריכה
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  מחק
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Billing summary card ── */}
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-xs text-gray-500">
        <p className="font-medium text-gray-700 mb-1">סיכום הגדרות נוכחיות</p>
        <p>גבייה: <span className="font-medium text-gray-900">{BILLING_SOURCE_LABELS[billingSource]}</span></p>
        {annualFee && <p>דמי ניהול שנתיים: <span className="font-medium text-gray-900">{CURRENCY_SYMBOL[annualCurrency]}{parseFloat(annualFee).toLocaleString()} {annualCurrency}</span></p>}
        {commType !== "NONE" && commValue && (
          <p>
            עמלת סוכן: <span className="font-medium text-gray-900">
              {commType === "PERCENTAGE" ? `${commValue}%` : `${commValue}`}
              {commDealerId && dealers.find(d => d.id === commDealerId) ? ` → ${dealers.find(d => d.id === commDealerId)!.name}` : ""}
            </span>
          </p>
        )}
        {items.length > 0 && <p>{items.length} שירותים בכרטיס תעריפים</p>}
        {billingNotes && <p className="mt-1 italic">"{billingNotes}"</p>}
      </div>
    </div>
  );
}
