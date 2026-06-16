"use client";

import { useState } from "react";

type Alert = {
  id: string; type: string; severity: string; title: string;
  description: string | null; isRead: boolean; isDismissed: boolean;
  createdAt: Date; entityType: string | null; entityId: string | null;
};

const SEVERITY_CONFIG: Record<string, { badge: string; border: string }> = {
  URGENT: { badge: "bg-red-100 text-red-700", border: "border-red-200" },
  IMPORTANT: { badge: "bg-yellow-100 text-yellow-700", border: "border-yellow-200" },
  INFO: { badge: "bg-blue-100 text-blue-700", border: "border-blue-200" },
};

const SEVERITY_LABELS: Record<string, string> = {
  URGENT: "דחוף", IMPORTANT: "חשוב", INFO: "מידע",
};

export function AlertsPanel({ alerts, typeLabels }: { alerts: Alert[]; typeLabels: Record<string, string> }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "URGENT" | "IMPORTANT" | "INFO">("all");

  async function dismiss(id: string) {
    setDismissed((prev) => new Set([...prev, id]));
    await fetch(`/api/alerts/${id}/dismiss`, { method: "POST" });
  }

  const visible = alerts.filter(
    (a) => !dismissed.has(a.id) && (filter === "all" || a.severity === filter)
  );

  const counts = {
    URGENT: alerts.filter((a) => a.severity === "URGENT" && !dismissed.has(a.id)).length,
    IMPORTANT: alerts.filter((a) => a.severity === "IMPORTANT" && !dismissed.has(a.id)).length,
    INFO: alerts.filter((a) => a.severity === "INFO" && !dismissed.has(a.id)).length,
  };

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {([["all", "הכל"], ["URGENT", "דחוף"], ["IMPORTANT", "חשוב"], ["INFO", "מידע"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${filter === id ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            {label}
            {id !== "all" && counts[id] > 0 && (
              <span className="ml-1 text-xs opacity-75">({counts[id]})</span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.length === 0 && (
          <div className="rounded-xl border bg-white p-8 text-center text-gray-400">
            אין התראות בקטגוריה זו
          </div>
        )}
        {visible.map((alert) => {
          const cfg = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.INFO;
          return (
            <div key={alert.id} className={`rounded-xl border bg-white p-4 ${cfg.border}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cfg.badge}`}>
                      {SEVERITY_LABELS[alert.severity]}
                    </span>
                    <span className="text-xs text-gray-400">{typeLabels[alert.type] ?? alert.type}</span>
                  </div>
                  <p className="font-medium text-gray-900">{alert.title}</p>
                  {alert.description && <p className="text-sm text-gray-500 mt-0.5">{alert.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">{new Date(alert.createdAt).toLocaleDateString("he-IL")}</p>
                </div>
                <button onClick={() => dismiss(alert.id)}
                  className="text-gray-300 hover:text-red-400 text-lg leading-none shrink-0">×</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
