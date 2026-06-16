"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInvoice } from "@/actions/finance";

type Client = { id: string; name: string };
type Project = { id: string; type: string; status: string; client: { name: string }; site: { name: string } };

type LineItem = { description: string; quantity: number; unitPrice: number; total: number };

const PROJECT_TYPE_LABELS: Record<string, string> = { ANNUAL: "שנתי", LAB: "מעבדה", SPECIFIC: "ספציפי" };

export function NewInvoiceForm({ clients, projects, orgId }: { clients: Client[]; projects: Project[]; orgId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [releaseCert, setReleaseCert] = useState(false);
  const [lines, setLines] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0, total: 0 },
  ]);

  const clientProjects = projects.filter((p) => p.client && clientId
    ? p.client.name === clients.find((c) => c.id === clientId)?.name
    : true
  );

  const grandTotal = lines.reduce((s, l) => s + l.total, 0);

  function updateLine(idx: number, field: keyof LineItem, val: string | number) {
    setLines((prev) => {
      const next = [...prev];
      const line = { ...next[idx], [field]: val };
      if (field === "quantity" || field === "unitPrice") {
        line.total = Number(line.quantity) * Number(line.unitPrice);
      }
      next[idx] = line;
      return next;
    });
  }

  function addLine() {
    setLines((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  }

  function removeLine(idx: number) {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId || !invoiceNumber) { setError("בחר לקוח והזן מספר חשבונית"); return; }
    if (lines.some((l) => !l.description)) { setError("מלא תיאור לכל שורה"); return; }
    setSaving(true);
    setError("");
    try {
      await createInvoice({
        organizationId: orgId,
        clientId,
        projectId: projectId || undefined,
        number: invoiceNumber,
        items: lines,
        total: grandTotal,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        releaseCertOnPayment: releaseCert,
      });
      router.push("/finance");
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client & project */}
      <div className="rounded-xl border bg-white p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">פרטי לקוח</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">לקוח <span className="text-red-500">*</span></label>
            <select required value={clientId} onChange={(e) => { setClientId(e.target.value); setProjectId(""); }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="" disabled>בחר לקוח...</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">פרויקט</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— ללא פרויקט ספציפי —</option>
              {clientProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.site.name} — {PROJECT_TYPE_LABELS[p.type] ?? p.type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Invoice meta */}
      <div className="rounded-xl border bg-white p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">פרטי חשבונית</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">מספר חשבונית <span className="text-red-500">*</span></label>
            <input required value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="לדוגמה: INV-2024-001"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">תאריך יעד לתשלום</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={releaseCert} onChange={(e) => setReleaseCert(e.target.checked)}
            className="rounded border-gray-300" />
          שחרר תעודה בתשלום
        </label>
      </div>

      {/* Line items */}
      <div className="rounded-xl border bg-white p-5">
        <h2 className="font-semibold text-gray-900 mb-4">פירוט</h2>
        <div className="space-y-2">
          {lines.map((line, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <input value={line.description} onChange={(e) => updateLine(idx, "description", e.target.value)}
                placeholder="תיאור שירות / מוצר"
                className="col-span-5 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" min="1" value={line.quantity} onChange={(e) => updateLine(idx, "quantity", Number(e.target.value))}
                className="col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" min="0" step="0.01" value={line.unitPrice} onChange={(e) => updateLine(idx, "unitPrice", Number(e.target.value))}
                placeholder="מחיר יחידה"
                className="col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="col-span-2 text-sm font-medium text-gray-900 text-end">
                ₪{line.total.toLocaleString()}
              </div>
              <button type="button" onClick={() => removeLine(idx)} className="col-span-1 text-gray-300 hover:text-red-500 text-lg leading-none">×</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addLine}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800">+ הוסף שורה</button>

        <div className="mt-4 border-t pt-4 flex justify-end">
          <div className="text-start">
            <p className="text-sm text-gray-500">סה"כ לתשלום</p>
            <p className="text-2xl font-bold text-gray-900">₪{grandTotal.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">⚠ {error}</div>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {saving ? "שומר..." : "צור חשבונית"}
        </button>
        <a href="/finance" className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">ביטול</a>
      </div>
    </form>
  );
}
