"use client";

import { useState, useMemo, useRef, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { updateRawMaterialFiles, upsertRawMaterialApproval, deleteRawMaterialApproval } from "@/actions/products";

const KOSHER_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  PAREVE: { label: "פרווה", color: "bg-gray-100 text-gray-700" },
  DAIRY:  { label: "חלבי",  color: "bg-blue-100 text-blue-700" },
  MEAT:   { label: "בשרי",  color: "bg-red-100 text-red-700" },
};

const STATUS_LABELS: Record<string, { label: string; color: string; dot: string }> = {
  PENDING:    { label: "ממתין",     color: "bg-amber-50 text-amber-700",  dot: "bg-amber-500" },
  IN_REVIEW:  { label: "בבדיקה",   color: "bg-blue-50 text-blue-700",    dot: "bg-blue-500" },
  APPROVED:   { label: "מאושר",    color: "bg-green-50 text-green-700",  dot: "bg-green-500" },
  REJECTED:   { label: "נדחה",     color: "bg-red-50 text-red-700",      dot: "bg-red-500" },
  EXPIRED:    { label: "פג תוקף",  color: "bg-orange-50 text-orange-700",dot: "bg-orange-500" },
  NEEDS_INFO: { label: "נדרש מידע",color: "bg-purple-50 text-purple-700",dot: "bg-purple-500" },
};

function countryName(code: string): string {
  if (!code) return code;
  if (code.length <= 3 && code === code.toUpperCase()) {
    try { return new Intl.DisplayNames(["he"], { type: "region" }).of(code) ?? code; } catch { return code; }
  }
  return code;
}

function formatDate(d: Date | string | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("he-IL").format(new Date(d));
}

type Approval = {
  certBodyId: string;
  certBody: { id: string; name: string };
  status: string;
  approvedBy: string | null;
  approvedAt: Date | null;
  expiresAt: Date | null;
  notes: string | null;
  yearRound: boolean;
  passover: boolean;
  kitniyot: boolean;
  classificationOverride: string | null;
};

type RawMaterial = {
  id: string;
  name: string;
  supplier: string | null;
  country: string | null;
  status: string;
  expiresAt: Date | null;
  certificateFile: string | null;
  imageUrl: string | null;
  requiresKosherSymbol: boolean;
  factorySpecific: boolean;
  kosherType: string;
  certificateIssuedBy: string | null;
  approvals: Approval[];
  product: {
    id: string;
    name: string;
    site: { id: string; name: string; country: string };
    certBodyProducts: { certBody: { id: string; name: string } }[];
  };
};

type CertBody = { id: string; name: string };

// ─── Approval Row ─────────────────────────────────────────────────────────────

function ApprovalRow({
  rawMaterialId,
  approval,
  onUpdate,
  onDelete,
}: {
  rawMaterialId: string;
  approval: Approval;
  onUpdate: (certBodyId: string, patch: Partial<Approval>) => void;
  onDelete: (certBodyId: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(approval.status);
  const [approvedBy, setApprovedBy] = useState(approval.approvedBy ?? "");
  const [expiresAt, setExpiresAt] = useState(
    approval.expiresAt ? new Date(approval.expiresAt).toISOString().slice(0, 10) : ""
  );
  const [notes, setNotes] = useState(approval.notes ?? "");
  const [yearRound, setYearRound] = useState(approval.yearRound ?? true);
  const [passover, setPassover] = useState(approval.passover ?? false);
  const [kitniyot, setKitniyot] = useState(approval.kitniyot ?? false);
  const [classificationOverride, setClassificationOverride] = useState(approval.classificationOverride ?? "");
  const [isPending, startTransition] = useTransition();

  const statusInfo = STATUS_LABELS[status] ?? STATUS_LABELS.PENDING;

  function handleSave() {
    startTransition(async () => {
      await upsertRawMaterialApproval(rawMaterialId, approval.certBodyId, {
        status,
        approvedBy: approvedBy || null,
        approvedAt: status === "APPROVED" ? new Date() : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        notes: notes || null,
        yearRound,
        passover,
        kitniyot,
        classificationOverride: classificationOverride || null,
      });
      onUpdate(approval.certBodyId, {
        status,
        approvedBy: approvedBy || null,
        notes: notes || null,
        yearRound,
        passover,
        kitniyot,
        classificationOverride: classificationOverride || null,
      });
      setEditing(false);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteRawMaterialApproval(rawMaterialId, approval.certBodyId);
      onDelete(approval.certBodyId);
    });
  }

  return (
    <div className="border border-gray-100 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
          {approval.certBody.name.slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{approval.certBody.name}</p>
          {approval.approvedAt && (
            <p className="text-xs text-gray-400">אושר {formatDate(approval.approvedAt)}</p>
          )}
        </div>
        {!editing && (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium flex items-center gap-1.5 ${statusInfo.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
            {statusInfo.label}
          </span>
        )}
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-xs text-gray-400 hover:text-blue-600 ml-1">✏️</button>
        )}
      </div>

      {editing && (
        <div className="space-y-2 pt-1 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 block mb-1">סטטוס</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white"
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">תוקף</label>
              <input
                type="date"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">אושר ע"י</label>
            <input
              value={approvedBy}
              onChange={e => setApprovedBy(e.target.value)}
              placeholder="שם המאשר"
              className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">הערות</label>
            <input
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="הערות (רשות)"
              className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">סיווג מיוחד (אופציונלי)</label>
            <input
              value={classificationOverride}
              onChange={e => setClassificationOverride(e.target.value)}
              placeholder="לדוגמה: D.E., Cholov Stam..."
              className="w-full text-xs border border-gray-200 rounded-md px-2 py-1.5"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">טווח אישור</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input type="checkbox" checked={yearRound} onChange={e => setYearRound(e.target.checked)} className="accent-green-600" />
                ימות השנה
              </label>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input type="checkbox" checked={passover} onChange={e => setPassover(e.target.checked)} className="accent-amber-600" />
                פסח
              </label>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input type="checkbox" checked={kitniyot} onChange={e => setKitniyot(e.target.checked)} className="accent-orange-600" />
                קטניות
              </label>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <button onClick={handleDelete} disabled={isPending} className="text-xs text-red-400 hover:text-red-600">
              הסר גוף
            </button>
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1">ביטול</button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isPending ? "שומר..." : "שמור"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!editing && (
        <div className="flex flex-wrap gap-1 mt-1">
          {approval.yearRound && <span className="text-[10px] bg-green-50 text-green-700 rounded-full px-1.5 py-0.5">ימות השנה</span>}
          {approval.passover && <span className="text-[10px] bg-amber-50 text-amber-700 rounded-full px-1.5 py-0.5">פסח</span>}
          {approval.kitniyot && <span className="text-[10px] bg-orange-50 text-orange-700 rounded-full px-1.5 py-0.5">קטניות</span>}
          {approval.classificationOverride && (
            <span className="text-[10px] bg-purple-50 text-purple-700 rounded-full px-1.5 py-0.5">{approval.classificationOverride}</span>
          )}
          {approval.expiresAt && <span className="text-[10px] text-gray-400">תוקף: {formatDate(approval.expiresAt)}</span>}
        </div>
      )}
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function RawMaterialModal({
  item,
  certBodies,
  onClose,
  onSaved,
}: {
  item: RawMaterial;
  certBodies: CertBody[];
  onClose: () => void;
  onSaved: (id: string, patch: Partial<RawMaterial>) => void;
}) {
  const [tab, setTab] = useState<"files" | "approvals" | "requirements">("approvals");
  const [certUrl, setCertUrl] = useState(item.certificateFile ?? "");
  const [imgUrl, setImgUrl] = useState(item.imageUrl ?? "");
  const [requiresSymbol, setRequiresSymbol] = useState(item.requiresKosherSymbol);
  const [factorySpecific, setFactorySpecific] = useState(item.factorySpecific);
  const [kosherType, setKosherType] = useState(item.kosherType ?? "PAREVE");
  const [certificateIssuedBy, setCertificateIssuedBy] = useState(item.certificateIssuedBy ?? "");
  const [approvals, setApprovals] = useState<Approval[]>(item.approvals);
  const [addingCertBodyId, setAddingCertBodyId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [filesPending, startFilesTrans] = useTransition();
  const [fileSaved, setFileSaved] = useState(false);
  const [addPending, startAddTrans] = useTransition();

  const certRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  const availableCertBodies = certBodies.filter(cb => !approvals.some(a => a.certBodyId === cb.id));

  async function uploadFile(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("files", file);
    const res = await fetch("/api/upload?folder=raw-materials", { method: "POST", body: fd });
    if (!res.ok) return null;
    const json = await res.json();
    return json.paths?.[0] ?? null;
  }

  async function handleCertChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const url = await uploadFile(file);
    if (url) setCertUrl(url);
    setUploading(false);
  }

  async function handleImgChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const url = await uploadFile(file);
    if (url) setImgUrl(url);
    setUploading(false);
  }

  function handleSaveFiles() {
    const patch = {
      certificateFile: certUrl || null,
      imageUrl: imgUrl || null,
      requiresKosherSymbol: requiresSymbol,
      factorySpecific,
      kosherType,
      certificateIssuedBy: certificateIssuedBy || null,
    };
    startFilesTrans(async () => {
      await updateRawMaterialFiles(item.id, patch);
      onSaved(item.id, patch);
      setFileSaved(true);
      setTimeout(() => setFileSaved(false), 2000);
    });
  }

  function handleApprovalUpdate(certBodyId: string, patch: Partial<Approval>) {
    setApprovals(prev => prev.map(a => a.certBodyId === certBodyId ? { ...a, ...patch } : a));
    onSaved(item.id, { approvals: approvals.map(a => a.certBodyId === certBodyId ? { ...a, ...patch } : a) });
  }

  function handleApprovalDelete(certBodyId: string) {
    const next = approvals.filter(a => a.certBodyId !== certBodyId);
    setApprovals(next);
    onSaved(item.id, { approvals: next });
  }

  function handleAddApproval() {
    if (!addingCertBodyId) return;
    const cb = certBodies.find(c => c.id === addingCertBodyId);
    if (!cb) return;
    startAddTrans(async () => {
      await upsertRawMaterialApproval(item.id, addingCertBodyId, { status: "PENDING" });
      const newApproval: Approval = {
        certBodyId: addingCertBodyId,
        certBody: cb,
        status: "PENDING",
        approvedBy: null,
        approvedAt: null,
        expiresAt: null,
        notes: null,
        yearRound: true,
        passover: false,
        kitniyot: false,
        classificationOverride: null,
      };
      const next = [...approvals, newApproval];
      setApprovals(next);
      onSaved(item.id, { approvals: next });
      setAddingCertBodyId("");
    });
  }

  const isImageFile = (url: string) => /\.(png|jpe?g|gif|webp|avif)$/i.test(url);

  const tabs = [
    { key: "approvals" as const, label: `אישורי גופי כשרות (${approvals.length})` },
    { key: "files" as const, label: "קבצים" },
    { key: "requirements" as const, label: "דרישות" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 shrink-0">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">{item.name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{item.product.name} · {item.product.site.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b shrink-0">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                tab === t.key
                  ? "border-blue-600 text-blue-600 bg-blue-50/50"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">

          {/* ── Approvals Tab ── */}
          {tab === "approvals" && (
            <div className="space-y-3">
              {approvals.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">אין אישורים עדיין</p>
              )}
              {approvals.map(appr => (
                <ApprovalRow
                  key={appr.certBodyId}
                  rawMaterialId={item.id}
                  approval={appr}
                  onUpdate={handleApprovalUpdate}
                  onDelete={handleApprovalDelete}
                />
              ))}

              {/* Add cert body */}
              {availableCertBodies.length > 0 && (
                <div className="flex gap-2 pt-1">
                  <select
                    value={addingCertBodyId}
                    onChange={e => setAddingCertBodyId(e.target.value)}
                    className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="">+ הוסף גוף כשרות...</option>
                    {availableCertBodies.map(cb => (
                      <option key={cb.id} value={cb.id}>{cb.name}</option>
                    ))}
                  </select>
                  {addingCertBodyId && (
                    <button
                      onClick={handleAddApproval}
                      disabled={addPending}
                      className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {addPending ? "..." : "הוסף"}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Files Tab ── */}
          {tab === "files" && (
            <div className="space-y-5">
              {/* Image */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">🖼️ תמונת מוצר</p>
                <div className="flex items-start gap-3">
                  {imgUrl && isImageFile(imgUrl) ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                      <Image src={imgUrl} alt="תמונת מוצר" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-2xl shrink-0">
                      📷
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <button onClick={() => imgRef.current?.click()} disabled={uploading}
                      className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium">
                      {imgUrl ? "החלף תמונה" : "העלה תמונה"}
                    </button>
                    {imgUrl && <button onClick={() => setImgUrl("")} className="text-xs text-red-400 hover:text-red-600">הסר</button>}
                    <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImgChange} />
                  </div>
                </div>
              </div>

              {/* Certificate issuer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">גוף שהנפיק את התעודה</label>
                <input
                  value={certificateIssuedBy}
                  onChange={e => setCertificateIssuedBy(e.target.value)}
                  placeholder="לדוגמה: OU, KOF-K, בד&quot;ץ..."
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
                />
              </div>

              {/* Certificate */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">📄 תעודת כשרות</p>
                <div className="flex items-center gap-3">
                  {certUrl ? (
                    <a href={certUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">
                      📄 {certUrl.split("/").pop()?.substring(0, 24) ?? "פתח"}
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">לא הועלתה תעודה</span>
                  )}
                  <button onClick={() => certRef.current?.click()} disabled={uploading}
                    className="text-xs bg-gray-50 text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-lg font-medium border border-gray-200">
                    {certUrl ? "החלף" : "העלה"}
                  </button>
                  {certUrl && <button onClick={() => setCertUrl("")} className="text-xs text-red-400 hover:text-red-600">הסר</button>}
                  <input ref={certRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={handleCertChange} />
                </div>
                {uploading && <p className="text-xs text-blue-500 mt-1 animate-pulse">מעלה...</p>}
              </div>

              <button
                onClick={handleSaveFiles}
                disabled={filesPending || uploading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-60"
              >
                {fileSaved ? "✓ נשמר" : filesPending ? "שומר..." : "שמור קבצים"}
              </button>
            </div>
          )}

          {/* ── Requirements Tab ── */}
          {tab === "requirements" && (
            <div className="space-y-4">
              {/* Kosher classification */}
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-4">
                <p className="text-sm font-semibold text-blue-800 mb-3">🥛 סיווג כשרות</p>
                <div className="flex gap-2">
                  {Object.entries(KOSHER_TYPE_LABELS).map(([k, v]) => (
                    <button
                      key={k}
                      onClick={() => setKosherType(k)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                        kosherType === k
                          ? `${v.color} border-current`
                          : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-4 space-y-3">
                <p className="text-sm font-semibold text-amber-800">⚜️ דרישות כשרות</p>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={requiresSymbol} onChange={e => setRequiresSymbol(e.target.checked)} className="mt-0.5 accent-amber-600" />
                  <div>
                    <p className="text-sm text-gray-800 font-medium">נדרש סמל כשרות על התווית</p>
                    <p className="text-xs text-gray-500">חומר הגלם מחייב הצגת סמל הכשרות על גבי תווית המוצר</p>
                  </div>
                </label>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={factorySpecific} onChange={e => setFactorySpecific(e.target.checked)} className="mt-0.5 accent-amber-600" />
                  <div>
                    <p className="text-sm text-gray-800 font-medium">ספציפי למפעל — חייב להופיע על התווית</p>
                    <p className="text-xs text-gray-500">שם המפעל חייב להיות מצוין על גבי תווית המוצר</p>
                  </div>
                </label>
              </div>
              <button
                onClick={handleSaveFiles}
                disabled={filesPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-60"
              >
                {fileSaved ? "✓ נשמר" : filesPending ? "שומר..." : "שמור דרישות"}
              </button>
            </div>
          )}
        </div>

        {/* Footer close */}
        <div className="px-6 py-3 border-t bg-gray-50 shrink-0 flex justify-end">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">סגור</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main List ────────────────────────────────────────────────────────────────

export function RawMaterialsList({
  items: initialItems,
  certBodies,
}: {
  items: RawMaterial[];
  certBodies: CertBody[];
}) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [certBodyFilter, setCertBodyFilter] = useState("");
  const [kosherTypeFilter, setKosherTypeFilter] = useState("");
  const [selected, setSelected] = useState<RawMaterial | null>(null);

  const allCountries = useMemo(() => {
    const set = new Set<string>();
    items.forEach(r => { if (r.product.site.country) set.add(r.product.site.country); });
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(r => {
      const matchSearch = !q ||
        r.name.toLowerCase().includes(q) ||
        (r.supplier?.toLowerCase().includes(q)) ||
        r.product.name.toLowerCase().includes(q) ||
        r.product.site.name.toLowerCase().includes(q);
      const matchStatus = !statusFilter || r.status === statusFilter;
      const matchCountry = !countryFilter || r.product.site.country === countryFilter;
      const matchCertBody = !certBodyFilter || r.approvals.some(a => a.certBodyId === certBodyFilter);
      const matchKosherType = !kosherTypeFilter || r.kosherType === kosherTypeFilter;
      return matchSearch && matchStatus && matchCountry && matchCertBody && matchKosherType;
    });
  }, [items, search, statusFilter, countryFilter, certBodyFilter]);

  const expiringSoon = items.filter(r => {
    if (!r.expiresAt || r.status !== "APPROVED") return false;
    const daysLeft = (new Date(r.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysLeft <= 60 && daysLeft > 0;
  }).length;

  function handleSaved(id: string, patch: Partial<RawMaterial>) {
    setItems(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, ...patch } : prev);
  }

  return (
    <>
      {selected && (
        <RawMaterialModal
          item={selected}
          certBodies={certBodies}
          onClose={() => setSelected(null)}
          onSaved={handleSaved}
        />
      )}

      {expiringSoon > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm text-orange-700">
          <span className="font-medium">⚠️ {expiringSoon} חומרי גלם</span> עם תוקף שיפוג תוך 60 יום
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-44">
          <span className="absolute inset-y-0 start-3 flex items-center text-gray-400 pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
              <path d="M6.5 1a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zm-7 5.5a7 7 0 1 1 12.469 4.348l3.469 3.468a.75.75 0 1 1-1.06 1.061l-3.47-3.468A7 7 0 0 1-.5 6.5z" fill="currentColor"/>
            </svg>
          </span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם, ספק, מוצר..."
            className="w-full rounded-lg border border-gray-200 bg-white ps-9 pe-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
          <option value="">כל המדינות</option>
          {allCountries.map(c => <option key={c} value={c}>{countryName(c)}</option>)}
        </select>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
          <option value="">כל הסטטוסים</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>

        <select value={kosherTypeFilter} onChange={e => setKosherTypeFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
          <option value="">כל הסיווגים</option>
          {Object.entries(KOSHER_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>

        {certBodies.length > 0 && (
          <select value={certBodyFilter} onChange={e => setCertBodyFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
            <option value="">כל גופי הכשרות</option>
            {certBodies.map(cb => <option key={cb.id} value={cb.id}>{cb.name}</option>)}
          </select>
        )}

        {(search || statusFilter || countryFilter || certBodyFilter || kosherTypeFilter) && (
          <button onClick={() => { setSearch(""); setStatusFilter(""); setCountryFilter(""); setCertBodyFilter(""); setKosherTypeFilter(""); }}
            className="text-xs text-blue-600 hover:text-blue-800 underline">
            נקה סינון
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400 mb-3">{filtered.length} מתוך {items.length} חומרי גלם</p>

      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-start px-4 py-3 font-medium text-gray-600 w-[20%]">חומר גלם</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600 w-[11%]">ספק</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600 w-[15%]">מוצר</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600 w-[12%]">מפעל</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600 w-[9%]">מדינה</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600 w-[7%]">סטטוס</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600 w-[26%]">אישורי גופים</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                {items.length === 0 ? "אין חומרי גלם במערכת" : "אין תוצאות"}
              </td></tr>
            )}
            {filtered.map(r => {
              const statusInfo = STATUS_LABELS[r.status] ?? STATUS_LABELS.PENDING;
              return (
                <tr key={r.id} className="hover:bg-blue-50/30 cursor-pointer transition-colors" onClick={() => setSelected(r)}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{r.name}</p>
                    {r.country && <p className="text-xs text-gray-400 mt-0.5">מקור: {countryName(r.country)}</p>}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {r.kosherType && KOSHER_TYPE_LABELS[r.kosherType] && (
                        <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-medium ${KOSHER_TYPE_LABELS[r.kosherType].color}`}>
                          {KOSHER_TYPE_LABELS[r.kosherType].label}
                        </span>
                      )}
                      {r.requiresKosherSymbol && <span className="text-[10px] bg-amber-100 text-amber-700 rounded-full px-1.5 py-0.5">⚜️ סמל</span>}
                      {r.factorySpecific && <span className="text-[10px] bg-purple-100 text-purple-700 rounded-full px-1.5 py-0.5">🏭 מפעל</span>}
                      {(r.certificateFile || r.imageUrl) && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5">
                          {r.imageUrl ? "🖼️" : ""}{r.certificateFile ? "📄" : ""}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.supplier || "—"}</td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <Link href={`/products/${r.product.id}`} className="text-blue-600 hover:underline text-xs font-medium">{r.product.name}</Link>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <Link href={`/sites/${r.product.site.id}`} className="text-gray-600 hover:text-blue-600 hover:underline text-xs">{r.product.site.name}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-medium">
                      {countryName(r.product.site.country)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    {r.approvals.length === 0 ? (
                      <span className="text-xs text-gray-300">— אין אישורים</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {r.approvals.map(appr => {
                          const s = STATUS_LABELS[appr.status] ?? STATUS_LABELS.PENDING;
                          const scopeParts = [
                            appr.yearRound ? "ימות השנה" : null,
                            appr.passover ? "פסח" : null,
                            appr.kitniyot ? "קטניות" : null,
                          ].filter(Boolean);
                          return (
                            <div key={appr.certBodyId} className="flex flex-col gap-0.5">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${s.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                                {appr.certBody.name}
                              </span>
                              {scopeParts.length > 0 && (
                                <span className="text-[9px] text-gray-400 px-2">{scopeParts.join(" · ")}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-3 text-center">לחץ על שורה לניהול אישורים וקבצים</p>
    </>
  );
}
