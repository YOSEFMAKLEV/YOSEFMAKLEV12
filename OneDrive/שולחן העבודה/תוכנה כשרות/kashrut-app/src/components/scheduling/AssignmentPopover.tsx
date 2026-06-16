"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { updateAssignmentStatus } from "@/actions/assignments";
import { useRouter } from "next/navigation";

type Assignment = {
  id: string;
  scheduledAt: Date;
  scheduledEnd: Date | null;
  type: string;
  status: string;
  mashgiach: { id: string; name: string };
  site: { id: string; name: string; country: string; timezone: string };
  project: { id: string; type: string; clientId: string; client: { name: string } };
};

const STATUS_LABELS: Record<string, string> = {
  CREATED: "נוצר",
  SITE_CONFIRMED: "אושר ע\"י האתר",
  DEPARTED: "יצא לדרך",
  ARRIVED: "הגיע לאתר",
  COMPLETED: "הושלם",
  REPORTED: "דווח",
  APPROVED: "מאושר",
};

const STATUS_NEXT: Record<string, string> = {
  CREATED: "SITE_CONFIRMED",
  SITE_CONFIRMED: "DEPARTED",
  DEPARTED: "ARRIVED",
  ARRIVED: "COMPLETED",
  COMPLETED: "REPORTED",
  REPORTED: "APPROVED",
};

const TYPE_LABELS: Record<string, string> = {
  ANNUAL: "שנתי", SPECIFIC: "ספציפי", CONTINUOUS: "רציף", INITIAL: "ביקור ראשוני",
};
const PROJECT_TYPE_LABELS: Record<string, string> = {
  ANNUAL: "שנתי", LAB: "מעבדה", SPECIFIC: "ספציפי",
};

function fmt(d: Date) {
  return new Intl.DateTimeFormat("he-IL", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(d));
}

export function AssignmentPopover({
  assignment: a,
  pos,
  onClose,
}: {
  assignment: Assignment;
  pos: { x: number; y: number };
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const nextStatus = STATUS_NEXT[a.status];

  async function advanceStatus() {
    if (!nextStatus) return;
    await updateAssignmentStatus(a.id, nextStatus as Parameters<typeof updateAssignmentStatus>[1]);
    router.refresh();
    onClose();
  }

  return (
    <div
      ref={ref}
      className="fixed z-50 w-72 rounded-xl border bg-white shadow-xl"
      style={{ left: Math.min(pos.x, window.innerWidth - 300), top: pos.y }}
    >
      <div className="p-4 border-b">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-gray-900">{a.mashgiach.name}</p>
            <p className="text-sm text-gray-500">{a.site.name} · {a.site.country}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
        </div>
      </div>

      <div className="p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">לקוח</span>
          <Link href={`/clients/${a.project.clientId}`} className="text-blue-600 hover:underline font-medium">
            {a.project.client.name}
          </Link>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">סוג ביקור</span>
          <span className="font-medium">{TYPE_LABELS[a.type] ?? a.type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">סוג פרויקט</span>
          <span className="font-medium">{PROJECT_TYPE_LABELS[a.project.type] ?? a.project.type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">מתוזמן</span>
          <span className="font-medium text-xs">{fmt(a.scheduledAt)}</span>
        </div>
        {a.scheduledEnd && (
          <div className="flex justify-between">
            <span className="text-gray-500">עד</span>
            <span className="font-medium text-xs">{fmt(a.scheduledEnd)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">אזור זמן</span>
          <span className="text-xs text-gray-600">{a.site.timezone}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500">סטטוס</span>
          <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs font-medium">
            {STATUS_LABELS[a.status] ?? a.status}
          </span>
        </div>
      </div>

      <div className="p-4 border-t flex flex-col gap-2">
        {nextStatus && (
          <button
            onClick={advanceStatus}
            className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            עדכן: {STATUS_LABELS[nextStatus]}
          </button>
        )}
        <Link
          href={`/scheduling/${a.id}`}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 text-center"
        >
          פתח פרטי שיבוץ
        </Link>
      </div>
    </div>
  );
}
