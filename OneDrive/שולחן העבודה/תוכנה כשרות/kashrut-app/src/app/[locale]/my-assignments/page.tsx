import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/auth";

const STATUS_LABELS: Record<string, string> = {
  CREATED: "נוצר",
  SITE_CONFIRMED: 'אושר ע"י אתר',
  DEPARTED: "יצא לדרך",
  ARRIVED: "הגיע",
  COMPLETED: "הסתיים",
  REPORTED: "דוח הוגש",
  APPROVED: "מאושר",
};
const STATUS_COLORS: Record<string, string> = {
  CREATED: "bg-gray-100 text-gray-600",
  SITE_CONFIRMED: "bg-blue-100 text-blue-700",
  DEPARTED: "bg-yellow-100 text-yellow-700",
  ARRIVED: "bg-orange-100 text-orange-700",
  COMPLETED: "bg-red-100 text-red-700",
  REPORTED: "bg-purple-100 text-purple-700",
  APPROVED: "bg-green-100 text-green-700",
};
const TYPE_LABELS: Record<string, string> = {
  ANNUAL: "שנתי",
  LAB: "מעבדה",
  SPECIFIC: "ספציפי",
};

type AssignmentWithRelations = {
  id: string;
  status: string;
  scheduledAt: Date;
  site: { name: string; country: string };
  project: { id: string; type: string; client: { name: string } } | null;
};

function AssignmentRow({
  a,
  now,
  showRelativeTime = true,
}: {
  a: AssignmentWithRelations;
  now: Date;
  showRelativeTime?: boolean;
}) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffDays = Math.ceil(
    (new Date(a.scheduledAt).getTime() - now.getTime()) / msPerDay
  );
  const isFuture = diffDays > 0;
  const absDays = Math.abs(diffDays);

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-medium text-gray-900 text-sm">{a.site.name}</p>
          <span className="text-xs text-gray-400">{a.site.country}</span>
        </div>
        <p className="text-xs text-gray-500">
          {a.project?.client?.name} ·{" "}
          {TYPE_LABELS[a.project?.type ?? ""] ?? a.project?.type}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date(a.scheduledAt).toLocaleDateString("he-IL", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {showRelativeTime && (
          <span
            className={`text-xs font-medium ${
              isFuture ? "text-blue-600" : "text-gray-400"
            }`}
          >
            {isFuture ? `בעוד ${absDays} ימים` : `לפני ${absDays} ימים`}
          </span>
        )}
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            STATUS_COLORS[a.status] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {STATUS_LABELS[a.status] ?? a.status}
        </span>
        <Link
          href={`/scheduling/${a.id}`}
          className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
        >
          פתח
        </Link>
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  count,
  headerClass,
  badgeClass,
  children,
  emptyText,
}: {
  title: string;
  subtitle: string;
  count: number;
  headerClass: string;
  badgeClass: string;
  children: React.ReactNode;
  emptyText: string;
}) {
  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <div
        className={`flex items-center justify-between px-5 py-4 border-b ${headerClass}`}
      >
        <div>
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        <span className={`rounded-full text-xs font-bold px-2.5 py-1 ${badgeClass}`}>
          {count}
        </span>
      </div>
      <div className="divide-y divide-gray-100">
        {count === 0 ? (
          <p className="text-center py-8 text-gray-400 text-sm">{emptyText}</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export default async function MyAssignmentsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const mashgiach = userId
    ? await prisma.mashgiach.findFirst({ where: { userId } })
    : null;

  const now = new Date();

  const includeRelations = {
    site: { select: { name: true, country: true } },
    project: {
      select: {
        id: true,
        type: true,
        client: { select: { name: true } },
      },
    },
  } as const;

  const [upcoming, pendingClosure, completed] = mashgiach
    ? await Promise.all([
        // All future assignments not yet started
        prisma.assignment.findMany({
          where: {
            mashgiachId: mashgiach.id,
            scheduledAt: { gte: now },
            status: { in: ["CREATED", "SITE_CONFIRMED", "DEPARTED"] },
          },
          include: includeRelations,
          orderBy: { scheduledAt: "asc" },
        }),
        // Past assignments arrived/completed but no report yet
        prisma.assignment.findMany({
          where: {
            mashgiachId: mashgiach.id,
            scheduledAt: { lt: now },
            status: { in: ["ARRIVED", "COMPLETED"] },
          },
          include: includeRelations,
          orderBy: { scheduledAt: "desc" },
        }),
        // Fully done: report submitted or approved
        prisma.assignment.findMany({
          where: {
            mashgiachId: mashgiach.id,
            status: { in: ["REPORTED", "APPROVED"] },
          },
          include: includeRelations,
          orderBy: { scheduledAt: "desc" },
          take: 50,
        }),
      ])
    : [[], [], []];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">הפרויקטים שלי</h1>
        {mashgiach && (
          <p className="text-sm text-gray-500 mt-0.5">{mashgiach.name}</p>
        )}
      </div>

      {!mashgiach && (
        <div className="rounded-xl border bg-white p-8 text-center text-gray-400">
          לא נמצא פרופיל משגיח מקושר למשתמש זה
        </div>
      )}

      {mashgiach && (
        <div className="space-y-6">
          {/* Upcoming */}
          <Section
            title="פרויקטים עתידיים"
            subtitle="שיבוצים קרובים שטרם התקיימו"
            count={upcoming.length}
            headerClass="bg-blue-50"
            badgeClass="bg-blue-600 text-white"
            emptyText="אין שיבוצים עתידיים מתוכננים"
          >
            {upcoming.map((a) => (
              <AssignmentRow key={a.id} a={a} now={now} />
            ))}
          </Section>

          {/* Pending closure */}
          <Section
            title="ממתינים לסגירה"
            subtitle="ביקורים שהסתיימו — טרם הוגש דוח"
            count={pendingClosure.length}
            headerClass="bg-orange-50"
            badgeClass={
              pendingClosure.length > 0
                ? "bg-orange-500 text-white"
                : "bg-gray-200 text-gray-600"
            }
            emptyText="אין ביקורים פתוחים — הכל מסודר ✓"
          >
            {pendingClosure.map((a) => (
              <AssignmentRow key={a.id} a={a} now={now} />
            ))}
          </Section>

          {/* Completed */}
          <Section
            title="הסתיימו"
            subtitle="פרויקטים שהושלמו ודוח הוגש (50 אחרונים)"
            count={completed.length}
            headerClass="bg-gray-50"
            badgeClass="bg-gray-400 text-white"
            emptyText="אין פרויקטים מושלמים עדיין"
          >
            {completed.map((a) => (
              <AssignmentRow key={a.id} a={a} now={now} showRelativeTime={false} />
            ))}
          </Section>
        </div>
      )}
    </div>
  );
}
