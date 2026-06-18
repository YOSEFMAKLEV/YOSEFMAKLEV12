"use client";

import { useState } from "react";
import { createDealer, updateDealer, deleteDealer } from "@/actions/dealers";

type Dealer = {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  isActive: boolean;
  _count: { projects: number; defaultForClients: number };
};

type FormData = { name: string; contactName: string; phone: string; email: string; notes: string };

const EMPTY: FormData = { name: "", contactName: "", phone: "", email: "", notes: "" };

export function DealersManager({ dealers: initial, organizationId }: { dealers: Dealer[]; organizationId: string }) {
  const [dealers, setDealers] = useState<Dealer[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [saving, setSaving] = useState(false);

  function startAdd() {
    setEditId(null);
    setForm(EMPTY);
    setShowForm(true);
  }

  function startEdit(d: Dealer) {
    setEditId(d.id);
    setForm({ name: d.name, contactName: d.contactName ?? "", phone: d.phone ?? "", email: d.email ?? "", notes: d.notes ?? "" });
    setShowForm(true);
  }

  function cancel() {
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    if (editId) {
      const updated = await updateDealer(editId, {
        name: form.name.trim(),
        contactName: form.contactName.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      setDealers(prev => prev.map(d => d.id === editId ? { ...d, ...updated } : d));
    } else {
      const created = await createDealer({
        organizationId,
        name: form.name.trim(),
        contactName: form.contactName.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      setDealers(prev => [...prev, { ...created, contactName: created.contactName ?? null, phone: created.phone ?? null, email: created.email ?? null, notes: created.notes ?? null, _count: { projects: 0, defaultForClients: 0 } }]);
    }
    cancel();
    setSaving(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`למחוק את הסוכן "${name}"?`)) return;
    await deleteDealer(id);
    setDealers(prev => prev.filter(d => d.id !== id));
  }

  return (
    <div className="space-y-4">
      {/* Add button */}
      <div className="flex justify-end">
        <button onClick={startAdd} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          + הוסף סוכן
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold text-gray-900 mb-4">{editId ? "עריכת סוכן" : "סוכן חדש"}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 mb-1">שם הסוכן *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="לדוגמה: ABC Trading Ltd."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">איש קשר</label>
              <input
                value={form.contactName}
                onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))}
                placeholder="שם איש קשר"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">טלפון</label>
              <input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+972..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">אימייל</label>
              <input
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="dealer@example.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">הערות</label>
              <input
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="הערות פנימיות..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "שומר..." : "שמור"}
            </button>
            <button onClick={cancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {dealers.length === 0 && !showForm ? (
        <div className="rounded-xl border bg-white p-12 text-center text-gray-400 text-sm">
          אין סוכנים עדיין — לחץ "+ הוסף סוכן"
        </div>
      ) : (
        <div className="rounded-xl border bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-start px-4 py-3 font-medium text-gray-600">שם</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">איש קשר</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">טלפון</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">אימייל</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">פרויקטים</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">יבואנים ברירת מחדל</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dealers.map(d => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                  <td className="px-4 py-3 text-gray-600">{d.contactName || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{d.phone || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{d.email || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-medium">
                      {d._count.projects}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 text-xs font-medium">
                      {d._count.defaultForClients}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => startEdit(d)} className="text-xs text-blue-600 hover:text-blue-800">עריכה</button>
                      <button
                        onClick={() => handleDelete(d.id, d.name)}
                        className="text-xs text-red-500 hover:text-red-700"
                        disabled={d._count.projects > 0}
                        title={d._count.projects > 0 ? "לא ניתן למחוק סוכן עם פרויקטים" : ""}
                      >
                        מחיקה
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
