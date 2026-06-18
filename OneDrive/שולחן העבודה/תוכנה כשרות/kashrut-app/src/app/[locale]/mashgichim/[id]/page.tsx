import Link from "next/link";
import { notFound } from "next/navigation";
import { getMashgiachById } from "@/actions/mashgichim";
import { getOfficeMessagesForMashgiach } from "@/actions/officeMessages";
import { MashgiachDetail } from "@/components/mashgichim/MashgiachDetail";

export default async function MashgiachDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [m, messages] = await Promise.all([
    getMashgiachById(id).catch(() => null),
    getOfficeMessagesForMashgiach(id).catch(() => []),
  ]);
  if (!m) notFound();

  const unreadCount = messages.filter((msg: { status: string }) => msg.status === "UNREAD").length;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/mashgichim" className="hover:text-gray-700">משגיחים</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{m.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{m.name}</h1>
          {m.nameEn && <p className="text-gray-500 text-sm mt-0.5">{m.nameEn}</p>}
          <div className="flex items-center gap-3 mt-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${m.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {m.isActive ? "פעיל" : "לא פעיל"}
            </span>
            {m.city && <span className="text-gray-400 text-sm">📍 {m.city}</span>}
            {m.phone && <span className="text-gray-400 text-sm">📞 {m.phone}</span>}
            {unreadCount > 0 && (
              <span className="rounded-full bg-blue-600 text-white text-xs px-2.5 py-0.5 font-medium">
                {unreadCount} הודעות חדשות
              </span>
            )}
          </div>
        </div>
        <Link href={`/mashgichim/${id}/edit`} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          עריכה
        </Link>
      </div>

      <MashgiachDetail m={m as Parameters<typeof MashgiachDetail>[0]["m"]} messages={messages} />
    </div>
  );
}
