"use client";

import { useState, useTransition, useRef } from "react";
import { createProfileEditRequest } from "@/actions/profileEditRequests";
import { sendOfficeMessage } from "@/actions/officeMessages";

const FIELD_LABELS: Record<string, string> = {
  phone: "טלפון",
  email: "אימייל",
  city: "עיר מגורים",
  nameEn: "שם באנגלית",
};

const LANG_LEVEL_LABELS: Record<string, string> = {
  native: "שפת אם", fluent: "שוטף", basic: "בסיסי",
};

function displayCountry(value: string): string {
  if (!value) return value;
  if (value.length <= 3 && value === value.toUpperCase()) {
    try {
      return new Intl.DisplayNames(["he"], { type: "region" }).of(value) ?? value;
    } catch { return value; }
  }
  return value;
}

type PendingRequest = {
  id: string;
  requestType: string;
  field: string;
  oldValue: string | null;
  newValue: string;
  createdAt: Date;
};

type Mashgiach = {
  id: string;
  organizationId: string;
  name: string;
  nameEn: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  citizenships: string[];
  languages: Record<string, string> | null;
  activeRegions: string[];
  levels: { name: string; color: string | null }[];
  certBodies: string[];
};

type DialogState = {
  field: string;
  requestType: "CHANGE" | "ADD";
  oldValue: string;
  placeholder: string;
  inputType: string;
} | null;

function PendingBadge({ req }: { req: PendingRequest }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs px-2.5 py-1 font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      ממתין לאישור: {req.newValue}
    </span>
  );
}

function FieldRow({
  label, value, field, pendingReqs, onRequest, canAdd = false,
}: {
  label: string;
  value: string | null;
  field: string;
  pendingReqs: PendingRequest[];
  onRequest: (opts: DialogState) => void;
  canAdd?: boolean;
}) {
  const pending = pendingReqs.filter(r => r.field === field);
  const hasPending = pending.length > 0;

  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0 gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <div className="flex flex-wrap items-center gap-2">
          {value ? (
            <span className={`text-sm font-medium ${hasPending ? "text-gray-400 line-through" : "text-gray-900"}`}>
              {value}
            </span>
          ) : (
            <span className="text-sm text-gray-300">לא הוזן</span>
          )}
          {pending.map(r => <PendingBadge key={r.id} req={r} />)}
        </div>
      </div>
      <div className="flex gap-1.5 flex-shrink-0 mt-1">
        {value && !hasPending && (
          <button
            onClick={() => onRequest({
              field,
              requestType: "CHANGE",
              oldValue: value,
              placeholder: `${label} חדש...`,
              inputType: field === "email" ? "email" : "text",
            })}
            className="rounded-lg border border-gray-200 bg-white text-xs text-gray-500 px-2.5 py-1 hover:border-blue-300 hover:text-blue-600 transition-colors"
          >
            בקש שינוי
          </button>
        )}
        {canAdd && !hasPending && (
          <button
            onClick={() => onRequest({
              field,
              requestType: "ADD",
              oldValue: "",
              placeholder: `${label} נוסף...`,
              inputType: field === "email" ? "email" : "text",
            })}
            className="rounded-lg border border-dashed border-gray-300 bg-white text-xs text-gray-500 px-2.5 py-1 hover:border-blue-300 hover:text-blue-600 transition-colors"
          >
            + הוסף
          </button>
        )}
      </div>
    </div>
  );
}

function RequestDialog({
  dialog, mashgiachId, organizationId, onClose,
}: {
  dialog: DialogState;
  mashgiachId: string;
  organizationId: string;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  if (!dialog) return null;

  const isChange = dialog.requestType === "CHANGE";
  const fieldLabel = FIELD_LABELS[dialog.field] ?? dialog.field;

  function handleSubmit() {
    if (!value.trim() || !dialog) return;
    const d = dialog;
    startTransition(async () => {
      await createProfileEditRequest({
        organizationId,
        mashgiachId,
        requestType: d.requestType,
        field: d.field,
        oldValue: isChange ? d.oldValue : undefined,
        newValue: value.trim(),
      });
      setSent(true);
      setTimeout(onClose, 1200);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
        {sent ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-2">✅</div>
            <p className="font-semibold text-gray-900">הבקשה נשלחה!</p>
            <p className="text-sm text-gray-500 mt-1">המנהל יאשר בהקדם</p>
          </div>
        ) : (
          <>
            <h2 className="text-base font-semibold text-gray-900 mb-1">
              {isChange ? `בקשת שינוי — ${fieldLabel}` : `בקשת הוספת ${fieldLabel}`}
            </h2>
            {isChange && dialog.oldValue && (
              <p className="text-xs text-gray-400 mb-3">
                ערך נוכחי: <span className="font-medium text-gray-600">{dialog.oldValue}</span>
              </p>
            )}
            {!isChange && (
              <p className="text-xs text-gray-400 mb-3">
                הוסף {fieldLabel} נוסף — המנהל יאשר ויעדכן בהתאם
              </p>
            )}
            <input
              type={dialog.inputType}
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={dialog.placeholder}
              autoFocus
              onKeyDown={e => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") onClose(); }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={!value.trim() || isPending}
                className="flex-1 rounded-lg bg-blue-600 text-white text-sm font-medium py-2 hover:bg-blue-700 disabled:opacity-40 transition-colors"
              >
                {isPending ? "שולח..." : "שלח בקשה"}
              </button>
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-200 text-gray-500 text-sm px-4 py-2 hover:bg-gray-50"
              >
                ביטול
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ContactOfficeDialog({
  mashgiachId,
  organizationId,
  onClose,
}: {
  mashgiachId: string;
  organizationId: string;
  onClose: () => void;
}) {
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  function handleFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    const arr = Array.from(newFiles);
    setFiles(prev => [...prev, ...arr]);
    arr.forEach(f => {
      const reader = new FileReader();
      reader.onload = e => setPreviews(prev => [...prev, e.target?.result as string]);
      reader.readAsDataURL(f);
    });
  }

  function removeFile(idx: number) {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  }

  function handleSend() {
    if (!body.trim() && files.length === 0) return;
    startTransition(async () => {
      let attachments: string[] = [];

      if (files.length > 0) {
        const fd = new FormData();
        files.forEach(f => fd.append("files", f));
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json();
        attachments = json.paths ?? [];
      }

      await sendOfficeMessage({ organizationId, mashgiachId, body: body.trim() || "(ללא טקסט)", attachments });
      setSent(true);
      setTimeout(onClose, 1500);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {sent ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">📨</div>
            <p className="font-semibold text-gray-900 text-lg">ההודעה נשלחה!</p>
            <p className="text-sm text-gray-500 mt-1">המשרד יקבל את הפנייה בהקדם</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">📞 צור קשר עם המשרד</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <div className="p-5 space-y-4">
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="כתוב את הפנייה שלך כאן..."
                rows={4}
                autoFocus
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

              {/* File previews */}
              {previews.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {previews.map((src, i) => (
                    <div key={i} className="relative">
                      {src.startsWith("data:image") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={src} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                      ) : (
                        <div className="w-16 h-16 flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-500 gap-1">
                          <span className="text-xl">📎</span>
                          <span className="truncate w-12 text-center">{files[i]?.name.split(".").pop()}</span>
                        </div>
                      )}
                      <button
                        onClick={() => removeFile(i)}
                        className="absolute -top-1.5 -end-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center leading-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Attachment buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50"
                >
                  📎 צרף קובץ
                </button>
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50"
                >
                  📷 צלם תמונה
                </button>
                <input ref={fileRef} type="file" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFiles(e.target.files)} />
              </div>
            </div>

            <div className="flex gap-2 p-5 pt-0">
              <button
                onClick={handleSend}
                disabled={(!body.trim() && files.length === 0) || isPending}
                className="flex-1 rounded-lg bg-blue-600 text-white text-sm font-medium py-2.5 hover:bg-blue-700 disabled:opacity-40 transition-colors"
              >
                {isPending ? "שולח..." : "שלח פנייה"}
              </button>
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-200 text-gray-500 text-sm px-4 py-2.5 hover:bg-gray-50"
              >
                ביטול
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function ProfileClient({ mashgiach, pendingRequests }: {
  mashgiach: Mashgiach;
  pendingRequests: PendingRequest[];
}) {
  const [dialog, setDialog] = useState<DialogState>(null);
  const [showContact, setShowContact] = useState(false);

  return (
    <>
      <div className="grid grid-cols-3 gap-5">

        {/* Main card */}
        <div className="col-span-2 space-y-5">

          {/* Avatar + name */}
          <div className="rounded-xl border bg-white p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold flex-shrink-0">
              {mashgiach.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{mashgiach.name}</h2>
              {mashgiach.nameEn && <p className="text-sm text-gray-500">{mashgiach.nameEn}</p>}
            </div>
          </div>

          {/* Contact details */}
          <div className="rounded-xl border bg-white p-5">
            <h3 className="font-semibold text-gray-900 mb-1">פרטי קשר</h3>
            <p className="text-xs text-gray-400 mb-4">
              לשינוי פרטים יש לשלוח בקשה — המנהל יאשר ויעדכן
            </p>
            <FieldRow label="טלפון" field="phone" value={mashgiach.phone} pendingReqs={pendingRequests} onRequest={setDialog} canAdd />
            <FieldRow label="אימייל" field="email" value={mashgiach.email} pendingReqs={pendingRequests} onRequest={setDialog} canAdd />
            <FieldRow label="עיר מגורים" field="city" value={mashgiach.city} pendingReqs={pendingRequests} onRequest={setDialog} />
            <FieldRow label="שם באנגלית" field="nameEn" value={mashgiach.nameEn} pendingReqs={pendingRequests} onRequest={setDialog} />
          </div>

          {/* Languages */}
          {mashgiach.languages && Object.keys(mashgiach.languages).length > 0 && (
            <div className="rounded-xl border bg-white p-5">
              <h3 className="font-semibold text-gray-900 mb-3">שפות</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(mashgiach.languages).map(([lang, level]) => (
                  <span key={lang} className="rounded-full bg-purple-50 text-purple-700 px-3 py-1 text-xs font-medium">
                    {lang} · {LANG_LEVEL_LABELS[level] ?? level}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Citizenships + regions */}
          {(mashgiach.citizenships.length > 0 || mashgiach.activeRegions.length > 0) && (
            <div className="rounded-xl border bg-white p-5 space-y-4">
              {mashgiach.citizenships.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">אזרחויות</p>
                  <div className="flex flex-wrap gap-1.5">
                    {mashgiach.citizenships.map(c => (
                      <span key={c} className="rounded-full bg-blue-50 text-blue-700 px-3 py-0.5 text-xs font-medium">{displayCountry(c)}</span>
                    ))}
                  </div>
                </div>
              )}
              {mashgiach.activeRegions.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">אזורי פעילות</p>
                  <div className="flex flex-wrap gap-1.5">
                    {mashgiach.activeRegions.map(r => (
                      <span key={r} className="rounded-full bg-green-50 text-green-700 px-3 py-0.5 text-xs font-medium">{displayCountry(r)}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contact office button */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900 text-sm">צור קשר עם המשרד</h3>
                <p className="text-xs text-blue-700 mt-0.5">שאלות, בקשות, תקלות — נשמח לעזור</p>
              </div>
              <button
                onClick={() => setShowContact(true)}
                className="rounded-lg bg-blue-600 text-white text-sm font-medium px-4 py-2 hover:bg-blue-700 transition-colors flex items-center gap-2 flex-shrink-0"
              >
                📨 שלח פנייה
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Pending requests */}
          {pendingRequests.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-semibold text-amber-900 mb-3 text-sm">⏳ בקשות ממתינות</h3>
              <div className="space-y-2">
                {pendingRequests.map(r => (
                  <div key={r.id} className="rounded-lg bg-white border border-amber-100 px-3 py-2.5">
                    <p className="text-xs font-medium text-amber-800">
                      {r.requestType === "ADD" ? "הוספת" : "שינוי"} {FIELD_LABELS[r.field] ?? r.field}
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      {r.requestType === "CHANGE" && r.oldValue && (
                        <><span className="line-through text-gray-400">{r.oldValue}</span> → </>
                      )}
                      {r.newValue}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cert bodies */}
          {mashgiach.certBodies.length > 0 && (
            <div className="rounded-xl border bg-white p-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">גופי כשרות מורשים</h3>
              <div className="space-y-1.5">
                {mashgiach.certBodies.map(cb => (
                  <span key={cb} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    {cb}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Supervision levels */}
          {mashgiach.levels.length > 0 && (
            <div className="rounded-xl border bg-white p-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">רמות השגחה</h3>
              <div className="flex flex-wrap gap-1.5">
                {mashgiach.levels.map(l => (
                  <span key={l.name} className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: l.color ? `${l.color}20` : "#f3f4f6", color: l.color ?? "#374151" }}>
                    {l.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Info note */}
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-700 leading-relaxed">
            לשינוי פרטים, שפות, אזרחויות ואזורי פעילות — שלח בקשה למנהל. שינויים יאושרו בהקדם.
          </div>
        </div>
      </div>

      <RequestDialog
        dialog={dialog}
        mashgiachId={mashgiach.id}
        organizationId={mashgiach.organizationId}
        onClose={() => setDialog(null)}
      />

      {showContact && (
        <ContactOfficeDialog
          mashgiachId={mashgiach.id}
          organizationId={mashgiach.organizationId}
          onClose={() => setShowContact(false)}
        />
      )}
    </>
  );
}
