"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { addActivityNote } from "@/actions/clients";

type ActivityLog = {
  id: string;
  action: string;
  description: string;
  createdAt: Date;
  user?: { name: string } | null;
};

type Props = {
  logs: ActivityLog[];
  clientId: string;
  organizationId: string;
};

const actionIcons: Record<string, string> = {
  created: "✨",
  updated: "✏️",
  note: "💬",
  status_changed: "🔄",
  certificate_issued: "📜",
  invoice_created: "💰",
  payment_received: "✅",
  assignment_created: "📅",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function ActivityDrawer({ logs, clientId, organizationId }: Props) {
  const t = useTranslations("activity");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAddNote() {
    if (!note.trim()) return;
    setSaving(true);
    await addActivityNote(clientId, organizationId, note.trim());
    setNote("");
    setSaving(false);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Add note */}
      <div className="p-4 border-b">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("addNote")}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddNote}
          disabled={!note.trim() || saving}
          className="mt-2 w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "שומר..." : "הוסף הערה"}
        </button>
      </div>

      {/* Log list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 text-sm">
            <span className="text-lg shrink-0">
              {actionIcons[log.action] ?? "•"}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-gray-800">{log.description}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatDate(log.createdAt)}
                {log.user && ` · ${log.user.name}`}
              </p>
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">אין פעילות עדיין</p>
        )}
      </div>
    </div>
  );
}
