"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { markMessageRead } from "@/actions/officeMessages";
import { useRouter } from "next/navigation";

type Level = { levelId: string; level: { name: string; color: string | null } };
type CertBody = { certBodyId: string; certBody: { name: string } };
type Assignment = {
  id: string;
  scheduledAt: Date;
  scheduledEnd: Date | null;
  site: { id: string; name: string; country: string };
  project: { id: string; type: string; status: string };
};
type OfficeMsg = {
  id: string;
  body: string;
  attachments: unknown;
  status: string;
  createdAt: Date;
};

type Mashgiach = {
  id: string;
  name: string;
  nameEn: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  citizenships: string[];
  activeRegions: string[];
  languages: unknown;
  salaryModel: string | null;
  salaryRate: number | null;
  expensesType: string | null;
  fixedExpenses: number | null;
  notes: string | null;
  isActive: boolean;
  levels: Level[];
  certBodies: CertBody[];
  assignments: Assignment[];
};

const salaryLabels: Record<string, string> = {
  HOURLY: "שעתי", DAILY: "יומי", MONTHLY: "חודשי", COMBINED: "משולב",
};
const expensesLabels: Record<string, string> = {
  NONE: "ללא", FIXED: "קבוע", VARIABLE: "לפי דיווח", BOTH: "קבוע + דיווח",
};
const projectTypeLabels: Record<string, string> = {
  ANNUAL: "שנתי", LAB: "מעבדה", SPECIFIC: "ספציפי",
};
const projectStatusColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  ACTIVE: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  APPROVED: "bg-purple-100 text-purple-700",
  CERTIFIED: "bg-teal-100 text-teal-700",
};
const langLevelLabels: Record<string, string> = {
  native: "שפת אם", fluent: "שוטף", basic: "בסיסי",
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("he-IL").format(new Date(d));
}

function MessagesList({ messages }: { messages: OfficeMsg[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const attachList = (msg: OfficeMsg) => (msg.attachments as string[] | null) ?? [];

  function handleRead(id: string) {
    startTransition(async () => {
      await markMessageRead(id);
      router.refresh();
    });
  }

  if (messages.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-6">אין הודעות ממשגיח זה</p>;
  }

  return (
    <div className="space-y-3">
      {messages.map(msg => (
        <div key={msg.id} className={`rounded-lg border p-4 ${msg.status === "UNREAD" ? "border-blue-200 bg-blue-50" : "border-gray-100 bg-white"}`}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              {msg.status === "UNREAD" && (
                <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-0.5" />
              )}
              <p className="text-xs text-gray-400">
                {new Intl.DateTimeFormat("he-IL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(msg.createdAt))}
              </p>
            </div>
            {msg.status === "UNREAD" && (
              <button
                onClick={() => handleRead(msg.id)}
                className="text-xs text-blue-600 hover:text-blue-800 flex-shrink-0"
              >
                סמן כנקרא
              </button>
            )}
          </div>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.body}</p>
          {attachList(msg).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {attachList(msg).map((path, i) => {
                const isImg = /\.(jpg|jpeg|png|gif|webp)$/i.test(path);
                return isImg ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <a key={i} href={path} target="_blank" rel="noopener noreferrer">
                    <img src={path} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity" />
                  </a>
                ) : (
                  <a key={i} href={path} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 hover:bg-gray-100"
                  >
                    📎 {path.split("/").pop()}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function MashgiachDetail({ m, messages = [] }: { m: Mashgiach; messages?: OfficeMsg[] }) {
  const langs = m.languages as Record<string, string> | null;
  const unreadCount = messages.filter(msg => msg.status === "UNREAD").length;

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left 2/3 */}
      <div className="col-span-2 space-y-5">

        {/* Profile */}
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold text-gray-900 mb-4">פרופיל</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div>
              <p className="text-gray-400 text-xs mb-0.5">אימייל</p>
              <p className="text-gray-900 font-medium">{m.email || "—"}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">שכר</p>
              <p className="text-gray-900 font-medium">
                {m.salaryModel ? `${salaryLabels[m.salaryModel] ?? m.salaryModel}${m.salaryRate ? ` · ₪${m.salaryRate}` : ""}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-0.5">הוצאות</p>
              <p className="text-gray-900 font-medium">
                {m.expensesType ? `${expensesLabels[m.expensesType] ?? m.expensesType}${m.fixedExpenses ? ` · ₪${m.fixedExpenses}` : ""}` : "—"}
              </p>
            </div>
          </div>

          {m.citizenships.length > 0 && (
            <div className="mt-4">
              <p className="text-gray-400 text-xs mb-1.5">אזרחויות</p>
              <div className="flex flex-wrap gap-1.5">
                {m.citizenships.map((c) => (
                  <span key={c} className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs font-medium">{c}</span>
                ))}
              </div>
            </div>
          )}

          {m.activeRegions.length > 0 && (
            <div className="mt-3">
              <p className="text-gray-400 text-xs mb-1.5">אזורי פעילות</p>
              <div className="flex flex-wrap gap-1.5">
                {m.activeRegions.map((r) => (
                  <span key={r} className="rounded-full bg-green-50 text-green-700 px-2.5 py-0.5 text-xs font-medium">{r}</span>
                ))}
              </div>
            </div>
          )}

          {langs && Object.keys(langs).length > 0 && (
            <div className="mt-3">
              <p className="text-gray-400 text-xs mb-1.5">שפות</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(langs).map(([lang, level]) => (
                  <span key={lang} className="rounded-full bg-purple-50 text-purple-700 px-2.5 py-0.5 text-xs">
                    {lang} · {langLevelLabels[level] ?? level}
                  </span>
                ))}
              </div>
            </div>
          )}

          {m.levels.length > 0 && (
            <div className="mt-3">
              <p className="text-gray-400 text-xs mb-1.5">רמות השגחה</p>
              <div className="flex flex-wrap gap-1.5">
                {m.levels.map((l) => (
                  <span key={l.levelId} className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: l.level.color ? `${l.level.color}20` : "#f3f4f6", color: l.level.color ?? "#374151" }}>
                    {l.level.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {m.certBodies.length > 0 && (
            <div className="mt-3">
              <p className="text-gray-400 text-xs mb-1.5">גופי כשרות מורשים</p>
              <div className="flex flex-wrap gap-1.5">
                {m.certBodies.map((cb) => (
                  <span key={cb.certBodyId} className="rounded-full bg-amber-50 text-amber-700 px-2.5 py-0.5 text-xs font-medium">{cb.certBody.name}</span>
                ))}
              </div>
            </div>
          )}

          {m.notes && (
            <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
              <p className="text-xs text-gray-400 mb-1">הערות</p>
              {m.notes}
            </div>
          )}
        </div>

        {/* Messages from mashgiach */}
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-semibold text-gray-900">הודעות מהמשגיח</h2>
            {unreadCount > 0 && (
              <span className="rounded-full bg-blue-600 text-white text-xs px-2 py-0.5 font-medium">{unreadCount}</span>
            )}
          </div>
          <MessagesList messages={messages} />
        </div>

        {/* Assignments */}
        <div className="rounded-xl border bg-white p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">שיבוצים ({m.assignments.length})</h2>
            <Link href={`/scheduling/new?mashgiachId=${m.id}`} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
              + שיבוץ חדש
            </Link>
          </div>
          {m.assignments.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">אין שיבוצים עדיין</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-400 border-b">
                <tr>
                  <th className="text-start pb-2">אתר</th>
                  <th className="text-start pb-2">תאריך</th>
                  <th className="text-start pb-2">סוג</th>
                  <th className="text-start pb-2">סטטוס</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {m.assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="py-2.5">
                      <Link href={`/sites/${a.site.id}`} className="text-blue-600 hover:underline">{a.site.name}</Link>
                      <p className="text-xs text-gray-400">{a.site.country}</p>
                    </td>
                    <td className="py-2.5 text-gray-600 text-xs">
                      {formatDate(a.scheduledAt)}{a.scheduledEnd ? ` – ${formatDate(a.scheduledEnd)}` : ""}
                    </td>
                    <td className="py-2.5 text-gray-600 text-xs">{projectTypeLabels[a.project.type] ?? a.project.type}</td>
                    <td className="py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${projectStatusColors[a.project.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {a.project.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Right sidebar */}
      <div className="space-y-4">
        <div className="rounded-xl border bg-white p-5">
          <h3 className="font-semibold text-gray-900 mb-3">סטטיסטיקות</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">סה"כ שיבוצים</span>
              <span className="font-bold text-gray-900">{m.assignments.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">שיבוצים פעילים</span>
              <span className="font-bold text-blue-600">
                {m.assignments.filter((a) => a.project.status === "ACTIVE").length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">גופי כשרות</span>
              <span className="font-bold text-gray-900">{m.certBodies.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">רמות השגחה</span>
              <span className="font-bold text-gray-900">{m.levels.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
