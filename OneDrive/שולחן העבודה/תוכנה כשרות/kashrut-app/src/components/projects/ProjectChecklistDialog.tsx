"use client";

import { useEffect, useState, useTransition } from "react";
import { getProjectChecklist, toggleChecklistItem } from "@/actions/projects";

type ChecklistItem = {
  id: string;
  isCompleted: boolean;
  completedAt: Date | null;
  completedBy: string | null;
  template: { label: string; category: string | null; order: number };
};

type Props = {
  projectId: string;
  projectName: string;
  onClose: () => void;
};

export function ProjectChecklistDialog({ projectId, projectName, onClose }: Props) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    getProjectChecklist(projectId).then((data) => {
      setItems(data as ChecklistItem[]);
      setLoading(false);
    });
  }, [projectId]);

  function toggle(item: ChecklistItem) {
    const next = !item.isCompleted;
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? { ...i, isCompleted: next, completedAt: next ? new Date() : null, completedBy: next ? "אני" : null }
          : i
      )
    );
    startTransition(async () => {
      await toggleChecklistItem(item.id, next);
    });
  }

  const completed = items.filter((i) => i.isCompleted).length;
  const total = items.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b bg-white">
          <div>
            <h2 className="font-bold text-gray-900 text-base">מעקב שלבי פרויקט</h2>
            <p className="text-sm text-gray-500 mt-0.5 leading-tight">{projectName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1 -mt-1 -me-1"
            aria-label="סגור"
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-5 py-3 border-b bg-gray-50">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span className="font-medium">התקדמות</span>
            <span className="font-semibold text-gray-700">{completed}/{total} שלבים</span>
          </div>
          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${pct}%`,
                background: pct === 100 ? "#16a34a" : "#2563eb",
              }}
            />
          </div>
          {pct === 100 && (
            <p className="text-xs text-green-600 font-medium mt-1.5">✓ כל השלבים הושלמו</p>
          )}
        </div>

        {/* Checklist items */}
        <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
          {loading ? (
            <div className="py-10 text-center text-gray-400 text-sm">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              טוען...
            </div>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                onClick={() => toggle(item)}
                className="w-full flex items-start gap-3.5 px-5 py-3.5 hover:bg-gray-50 transition-colors text-start"
              >
                {/* Checkbox */}
                <div
                  className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                    item.isCompleted
                      ? "bg-green-500 border-green-500"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {item.isCompleted && (
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                      <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                {/* Label + meta */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium leading-snug ${
                      item.isCompleted ? "text-gray-400 line-through" : "text-gray-900"
                    }`}
                  >
                    {item.template.label}
                  </p>
                  {item.template.category && (
                    <span className="inline-block mt-1 text-xs text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full">
                      {item.template.category}
                    </span>
                  )}
                  {item.isCompleted && item.completedAt && (
                    <p className="text-xs text-green-600 mt-0.5">
                      {new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "numeric", year: "2-digit" }).format(new Date(item.completedAt))}
                      {item.completedBy ? ` · ${item.completedBy}` : ""}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-gray-200 hover:bg-gray-300 py-2.5 text-sm font-medium text-gray-700 transition-colors"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}
