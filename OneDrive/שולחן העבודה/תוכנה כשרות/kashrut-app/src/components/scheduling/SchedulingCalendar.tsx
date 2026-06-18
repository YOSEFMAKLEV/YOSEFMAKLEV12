"use client";

import { useRef, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type {
  EventClickArg,
  EventContentArg,
  DateSelectArg,
  DayCellContentArg,
  DayHeaderContentArg,
  DatesSetArg,
} from "@fullcalendar/core";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { AssignmentPopover } from "./AssignmentPopover";

// ─── Hebrew numeral conversion ───────────────────────────────────────────────
// Days 1-30 (all valid Hebrew month days), with 15=ט"ו and 16=ט"ז (not spelling God's name)
const HEBREW_DAY: Record<number, string> = {
  1: "א׳", 2: "ב׳", 3: "ג׳", 4: "ד׳", 5: "ה׳",
  6: "ו׳", 7: "ז׳", 8: "ח׳", 9: "ט׳", 10: "י׳",
  11: 'י"א', 12: 'י"ב', 13: 'י"ג', 14: 'י"ד',
  15: 'ט"ו', 16: 'ט"ז',
  17: 'י"ז', 18: 'י"ח', 19: 'י"ט', 20: "כ׳",
  21: 'כ"א', 22: 'כ"ב', 23: 'כ"ג', 24: 'כ"ד',
  25: 'כ"ה', 26: 'כ"ו', 27: 'כ"ז', 28: 'כ"ח',
  29: 'כ"ט', 30: "ל׳",
};

function toHebrewYear(year: number): string {
  const y = year % 1000;
  const hundreds: Record<number, string> = {
    100: "ק", 200: "ר", 300: "ש", 400: "ת",
    500: "תק", 600: "תר", 700: "תש", 800: "תת", 900: "תתק",
  };
  const tens: Record<number, string> = {
    10: "י", 20: "כ", 30: "ל", 40: "מ", 50: "נ",
    60: "ס", 70: "ע", 80: "פ", 90: "צ",
  };
  const ones: Record<number, string> = {
    1: "א", 2: "ב", 3: "ג", 4: "ד", 5: "ה",
    6: "ו", 7: "ז", 8: "ח", 9: "ט",
  };
  const h = Math.floor(y / 100) * 100;
  const t = Math.floor((y % 100) / 10) * 10;
  const o = y % 10;
  let s = (hundreds[h] ?? "") + (tens[t] ?? "") + (ones[o] ?? "");
  // Insert geresh before last letter
  if (s.length >= 2) s = s.slice(0, -1) + '"' + s.slice(-1);
  else if (s.length === 1) s = s + "׳";
  return s;
}

// ─── Intl formatters ─────────────────────────────────────────────────────────
// Arabic day number in Hebrew calendar (for math)
const heDayNum = new Intl.DateTimeFormat("en-u-ca-hebrew", { day: "numeric" });
// Arabic year in Hebrew calendar
const heYearNum = new Intl.DateTimeFormat("en-u-ca-hebrew", { year: "numeric" });
// Month names
const heMonthFmt = new Intl.DateTimeFormat("he-u-ca-hebrew", { month: "long" });
const enMonthFmt = new Intl.DateTimeFormat("en-u-ca-hebrew", { month: "long" });
const enYearNum = new Intl.DateTimeFormat("en-u-ca-hebrew", { year: "numeric" });

function getHebrewDayNum(d: Date) {
  return parseInt(heDayNum.format(d), 10);
}

function isFirstOfHebrewMonth(d: Date) {
  return getHebrewDayNum(d) === 1;
}

function buildSubtitle(start: Date, end: Date, locale: string): string {
  const isHe = locale === "he";
  const monthFmt = isHe ? heMonthFmt : enMonthFmt;
  const startMonth = monthFmt.format(start);
  const endMonth = monthFmt.format(end);
  const yearRaw = parseInt(enYearNum.format(end), 10);
  const yearStr = isHe ? toHebrewYear(yearRaw) : String(yearRaw);
  const sep = isHe ? " — " : " – ";
  if (startMonth === endMonth) return `${startMonth} ${yearStr}`;
  return `${startMonth}${sep}${endMonth} ${yearStr}`;
}

// ─── Types ───────────────────────────────────────────────────────────────────
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

// ─── Component ────────────────────────────────────────────────────────────────
export function SchedulingCalendar({ assignments }: { assignments: Assignment[] }) {
  const router = useRouter();
  const locale = useLocale();
  const isHe = locale === "he";

  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<FullCalendar>(null);
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });
  const [subtitle, setSubtitle] = useState("");

  // Inject Hebrew subtitle inside .fc-toolbar-title, below "יוני 2026"
  useEffect(() => {
    if (!subtitle || !containerRef.current) return;
    const inject = () => {
      const titleEl = containerRef.current?.querySelector(".fc-toolbar-title");
      if (!titleEl) return;
      let sub = titleEl.querySelector(".heb-sub") as HTMLElement | null;
      if (!sub) {
        sub = document.createElement("small");
        sub.className = "heb-sub";
        Object.assign(sub.style, {
          display: "block",
          fontSize: "11px",
          color: "#2563eb",
          fontWeight: "600",
          textAlign: "center",
          lineHeight: "1.4",
          marginTop: "1px",
          direction: isHe ? "rtl" : "ltr",
          fontFamily: "inherit",
          letterSpacing: isHe ? "0" : "0.01em",
        });
        titleEl.appendChild(sub);
      }
      sub.textContent = subtitle;
    };
    const t = setTimeout(inject, 30);
    return () => clearTimeout(t);
  }, [subtitle, isHe]);

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
    router.push(`/scheduling/new?date=${info.startStr.split("T")[0]}`);
  }

  function handleDatesSet(info: DatesSetArg) {
    const start = info.view.currentStart;
    const end = new Date(info.view.currentEnd);
    end.setDate(end.getDate() - 1);
    setSubtitle(buildSubtitle(start, end, locale));
  }

  // Day cell: Hebrew day as letters (he) or Arabic number (en), no month name
  function renderDayCell(info: DayCellContentArg) {
    const dayNum = getHebrewDayNum(info.date);
    const hDay = isHe ? (HEBREW_DAY[dayNum] ?? String(dayNum)) : String(dayNum);
    const isFirst = dayNum === 1;

    return (
      <div className="flex flex-col items-end w-full px-1">
        <span className="text-sm leading-tight">{info.dayNumberText}</span>
        <span
          className={`leading-tight ${
            isFirst
              ? "text-blue-500 font-bold text-[10px]"
              : "text-gray-400 text-[10px]"
          }`}
        >
          {hDay}
        </span>
      </div>
    );
  }

  // Week view column header: day name + Hebrew day number only
  function renderDayHeader(info: DayHeaderContentArg) {
    const dayNum = getHebrewDayNum(info.date);
    const hDay = isHe ? (HEBREW_DAY[dayNum] ?? String(dayNum)) : String(dayNum);
    const isFirst = dayNum === 1;

    return (
      <div className="text-center py-0.5">
        <div className="font-medium text-sm">{info.text}</div>
        <div className={`text-[10px] ${isFirst ? "text-blue-500 font-bold" : "text-gray-400"}`}>
          {hDay}
        </div>
      </div>
    );
  }

  function renderEvent(info: EventContentArg) {
    const a = info.event.extendedProps.assignment as Assignment;
    return (
      <div className="px-1 py-0.5 truncate text-xs">
        <span className="font-medium">{a.mashgiach.name}</span>
        <span className="opacity-75"> · {a.site.name}</span>
        {a.site.country !== "IL" && <span className="opacity-60"> 🌍</span>}
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
             status === "SITE_CONFIRMED" ? 'אושר ע"י אתר' :
             status === "DEPARTED" ? "יצא לדרך" :
             status === "ARRIVED" ? "הגיע" :
             status === "COMPLETED" ? "הושלם" :
             status === "REPORTED" ? "דווח" : "מאושר"}
          </span>
        ))}
      </div>

      <div ref={containerRef} className="rounded-xl border bg-white overflow-hidden">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={locale}
          direction={isHe ? "rtl" : "ltr"}
          headerToolbar={{
            start: "prev,next today",
            center: "title",
            end: "dayGridMonth,timeGridWeek,listWeek",
          }}
          buttonText={{
            today: isHe ? "היום" : "Today",
            month: isHe ? "חודש" : "Month",
            week: isHe ? "שבוע" : "Week",
            list: isHe ? "רשימה" : "List",
          }}
          events={events}
          eventClick={handleEventClick}
          selectable={true}
          select={handleDateSelect}
          eventContent={renderEvent}
          dayCellContent={renderDayCell}
          dayHeaderContent={renderDayHeader}
          datesSet={handleDatesSet}
          height="auto"
          firstDay={0}
          weekends={true}
          dayMaxEvents={4}
          moreLinkText={(n) => `+${n} ${isHe ? "נוספים" : "more"}`}
        />
      </div>

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
