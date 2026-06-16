"use client";

import { useRef, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, EventContentArg, DateSelectArg } from "@fullcalendar/core";
import { useRouter } from "next/navigation";
import { AssignmentPopover } from "./AssignmentPopover";

type Assignment = {
  id: string;
  scheduledAt: Date;
  scheduledEnd: Date | null;
  type: string;
  status: string;
  mashgiach: { id: string; name: string };
  site: { id: string; name: string; country: string; timezone: string };
  project: {
    id: string;
    type: string;
    status: string;
    clientId: string;
    client: { name: string };
  };
};

const STATUS_COLORS: Record<string, string> = {
  CREATED: "#3b82f6",
  SITE_CONFIRMED: "#8b5cf6",
  DEPARTED: "#f59e0b",
  ARRIVED: "#10b981",
  COMPLETED: "#6b7280",
  REPORTED: "#059669",
  APPROVED: "#065f46",
};

const VISIT_TYPE_LABELS: Record<string, string> = {
  ANNUAL: "שנתי",
  SPECIFIC: "ספציפי",
  CONTINUOUS: "רציף",
  INITIAL: "ביקור ראשוני",
};

// Jewish holidays (static list for current year — @hebcal/core used server-side)
function getJewishHolidays(year: number) {
  // Key holidays approximate dates — will be enhanced server-side
  return [] as { date: string; name: string }[];
}

export function SchedulingCalendar({ assignments }: { assignments: Assignment[] }) {
  const router = useRouter();
  const calendarRef = useRef<FullCalendar>(null);
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });

  const events = assignments.map((a) => ({
    id: a.id,
    title: `${a.mashgiach.name} — ${a.site.name}`,
    start: new Date(a.scheduledAt),
    end: a.scheduledEnd ? new Date(a.scheduledEnd) : undefined,
    backgroundColor: STATUS_COLORS[a.status] ?? "#3b82f6",
    borderColor: STATUS_COLORS[a.status] ?? "#3b82f6",
    extendedProps: { assignment: a },
  }));

  function handleEventClick(info: EventClickArg) {
    const rect = info.el.getBoundingClientRect();
    setPopoverPos({ x: rect.left, y: rect.bottom + 8 });
    setSelected(info.event.extendedProps.assignment as Assignment);
  }

  function handleDateSelect(info: DateSelectArg) {
    const d = info.startStr.split("T")[0];
    router.push(`/scheduling/new?date=${d}`);
  }

  function renderEvent(info: EventContentArg) {
    const a = info.event.extendedProps.assignment as Assignment;
    return (
      <div className="px-1 py-0.5 truncate text-xs">
        <span className="font-medium">{a.mashgiach.name}</span>
        <span className="opacity-75"> · {a.site.name}</span>
        {a.site.country !== "ישראל" && (
          <span className="opacity-60"> 🌍</span>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <span key={status} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }} />
            {status === "CREATED" ? "נוצר" :
             status === "SITE_CONFIRMED" ? "אושר ע\"י אתר" :
             status === "DEPARTED" ? "יצא לדרך" :
             status === "ARRIVED" ? "הגיע" :
             status === "COMPLETED" ? "הושלם" :
             status === "REPORTED" ? "דווח" : "מאושר"}
          </span>
        ))}
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="he"
          direction="rtl"
          headerToolbar={{
            start: "prev,next today",
            center: "title",
            end: "dayGridMonth,timeGridWeek,listWeek",
          }}
          buttonText={{
            today: "היום",
            month: "חודש",
            week: "שבוע",
            list: "רשימה",
          }}
          events={events}
          eventClick={handleEventClick}
          selectable={true}
          select={handleDateSelect}
          eventContent={renderEvent}
          height="auto"
          firstDay={0}
          weekends={true}
          dayMaxEvents={4}
          moreLinkText={(n) => `+${n} נוספים`}
        />
      </div>

      {/* Popover */}
      {selected && (
        <AssignmentPopover
          assignment={selected}
          pos={popoverPos}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
