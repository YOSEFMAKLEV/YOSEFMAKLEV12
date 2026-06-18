"use client";

import { useState } from "react";
import { upsertSiteContact, deleteSiteContact, setSiteContactPrimary } from "@/actions/sites";

type Contact = {
  id: string;
  name: string;
  role: string | null;
  phone: string | null;
  email: string | null;
  isPrimary: boolean;
};

type Props = {
  siteId: string;
  contacts: Contact[];
  legacyName?: string | null;
  legacyPhone?: string | null;
  legacyEmail?: string | null;
};

type EditRow = { name: string; role: string; phone: string; email: string };

export function SiteContactsCard({ siteId, contacts: initial, legacyName, legacyPhone, legacyEmail }: Props) {
  const [contacts, setContacts] = useState<Contact[]>(initial);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EditRow>({ name: "", role: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);

  const useLegacy = contacts.length === 0 && (legacyName || legacyPhone || legacyEmail);

  async function handleSave(contactId: string | null) {
    if (!form.name.trim()) return;
    setSaving(true);
    const c = await upsertSiteContact(siteId, contactId, {
      name: form.name.trim(),
      role: form.role.trim() || undefined,
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
    });
    if (contactId) {
      setContacts(prev => prev.map(x => x.id === contactId ? { ...x, ...c } : x));
    } else {
      setContacts(prev => [...prev, { ...c, role: c.role ?? null, phone: c.phone ?? null, email: c.email ?? null }]);
    }
    setAdding(false);
    setEditingId(null);
    setForm({ name: "", role: "", phone: "", email: "" });
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("למחוק איש קשר זה?")) return;
    await deleteSiteContact(siteId, id);
    setContacts(prev => prev.filter(c => c.id !== id));
  }

  async function handleSetPrimary(id: string) {
    await setSiteContactPrimary(siteId, id);
    setContacts(prev => prev.map(c => ({ ...c, isPrimary: c.id === id })));
  }

  function startEdit(c: Contact) {
    setEditingId(c.id);
    setAdding(false);
    setForm({ name: c.name, role: c.role ?? "", phone: c.phone ?? "", email: c.email ?? "" });
  }

  function startAdd() {
    setAdding(true);
    setEditingId(null);
    setForm({ name: "", role: "", phone: "", email: "" });
  }

  function cancelForm() {
    setAdding(false);
    setEditingId(null);
    setForm({ name: "", role: "", phone: "", email: "" });
  }

  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-900">אנשי קשר</h2>
        {!adding && (
          <button onClick={startAdd} className="text-xs font-medium text-blue-600 hover:text-blue-800">
            + הוסף איש קשר
          </button>
        )}
      </div>

      {/* Legacy fallback */}
      {useLegacy && (
        <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 text-sm">
          {legacyName && <p className="font-medium text-gray-900">{legacyName}</p>}
          {legacyPhone && <p className="text-gray-500 text-xs mt-0.5">📞 {legacyPhone}</p>}
          {legacyEmail && <p className="text-gray-500 text-xs mt-0.5">✉ {legacyEmail}</p>}
        </div>
      )}

      {/* Contacts list */}
      {contacts.length > 0 && (
        <div className="space-y-3">
          {contacts.map((c) =>
            editingId === c.id ? (
              <ContactForm
                key={c.id}
                form={form}
                setForm={setForm}
                onSave={() => handleSave(c.id)}
                onCancel={cancelForm}
                saving={saving}
              />
            ) : (
              <div key={c.id} className="rounded-lg border border-gray-100 px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm text-gray-900">{c.name}</p>
                      {c.isPrimary && (
                        <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs font-medium">ראשי</span>
                      )}
                      {c.role && <span className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-0.5">{c.role}</span>}
                    </div>
                    <div className="mt-1 flex gap-4 flex-wrap">
                      {c.phone && <span className="text-xs text-gray-500">📞 {c.phone}</span>}
                      {c.email && <span className="text-xs text-gray-500">✉ {c.email}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!c.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(c.id)}
                        className="text-xs text-gray-400 hover:text-blue-600"
                        title="הגדר כראשי"
                      >
                        ★
                      </button>
                    )}
                    <button onClick={() => startEdit(c)} className="text-xs text-gray-400 hover:text-gray-700">עריכה</button>
                    <button onClick={() => handleDelete(c.id)} className="text-xs text-gray-400 hover:text-red-600">הסר</button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {contacts.length === 0 && !useLegacy && !adding && (
        <p className="text-gray-400 text-sm text-center py-4">אין אנשי קשר</p>
      )}

      {/* Add form */}
      {adding && (
        <div className={contacts.length > 0 ? "mt-3" : ""}>
          <ContactForm
            form={form}
            setForm={setForm}
            onSave={() => handleSave(null)}
            onCancel={cancelForm}
            saving={saving}
          />
        </div>
      )}
    </div>
  );
}

function ContactForm({
  form,
  setForm,
  onSave,
  onCancel,
  saving,
}: {
  form: EditRow;
  setForm: (f: EditRow) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input
          placeholder="שם *"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="rounded border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          placeholder="תפקיד"
          value={form.role}
          onChange={e => setForm({ ...form, role: e.target.value })}
          className="rounded border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          placeholder="טלפון"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          className="rounded border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          placeholder="אימייל"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className="rounded border border-gray-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5">ביטול</button>
        <button
          onClick={onSave}
          disabled={saving || !form.name.trim()}
          className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "שומר..." : "שמור"}
        </button>
      </div>
    </div>
  );
}
