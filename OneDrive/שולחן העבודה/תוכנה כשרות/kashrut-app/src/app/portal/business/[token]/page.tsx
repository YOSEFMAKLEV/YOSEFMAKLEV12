import { notFound } from "next/navigation";
import { getBusinessPortalData } from "@/actions/portal";

const PROJECT_TYPE_LABELS: Record<string, string> = { ANNUAL: "שנתי", LAB: "מעבדה", SPECIFIC: "ספציפי" };
const PROJECT_STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין", ACTIVE: "פעיל", COMPLETED: "הושלם", APPROVED: "מאושר", CERTIFIED: "תעודה הונפקה",
};
const RM_STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין", IN_REVIEW: "בבדיקה", APPROVED: "מאושר", REJECTED: "נדחה", EXPIRED: "פג תוקף", NEEDS_INFO: "נדרש מידע",
};
const SITE_TYPE_LABELS: Record<string, string> = {
  FACTORY: "מפעל", RESTAURANT: "מסעדה", HOTEL: "מלון", BAKERY: "מאפייה", WAREHOUSE: "מחסן", OTHER: "אחר",
};

export default async function BusinessPortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const site = await getBusinessPortalData(token);
  if (!site) notFound();

  const upcomingAssignments = site.assignments;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm text-gray-500 mb-1">{site.client.name}</p>
        <h1 className="text-2xl font-bold text-gray-900">{site.name}</h1>
        <div className="flex gap-3 mt-2 text-sm text-gray-500">
          <span>{SITE_TYPE_LABELS[site.type] ?? site.type}</span>
          <span>·</span>
          <span>{site.country}</span>
          {site.address && <><span>·</span><span>{site.address}</span></>}
        </div>
      </div>

      {/* Upcoming visits */}
      {upcomingAssignments.length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-900 mb-3">ביקורים קרובים</h2>
          <div className="space-y-2">
            {upcomingAssignments.map((a) => (
              <div key={a.id} className="rounded-xl border bg-blue-50 border-blue-200 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">{a.mashgiach.name}</p>
                  <p className="text-sm text-blue-700">
                    {new Date(a.scheduledAt).toLocaleDateString("he-IL")} ·{" "}
                    {new Date(a.scheduledAt).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">מתוזמן</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active projects */}
      {site.projects.length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-900 mb-3">פרויקטים פעילים</h2>
          <div className="space-y-2">
            {site.projects.map((p) => (
              <div key={p.id} className="rounded-xl border bg-white p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{PROJECT_TYPE_LABELS[p.type] ?? p.type}</p>
                  {p.certBody && <p className="text-sm text-gray-500">{p.certBody.name}</p>}
                </div>
                <span className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-0.5">
                  {PROJECT_STATUS_LABELS[p.status] ?? p.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section>
        <h2 className="font-semibold text-gray-900 mb-3">מוצרים ({site.products.length})</h2>
        {site.products.length === 0 ? (
          <p className="text-gray-400 text-sm">אין מוצרים רשומים</p>
        ) : (
          <div className="space-y-4">
            {site.products.map((prod) => {
              const pendingRm = prod.rawMaterials.filter((r) => r.status === "PENDING" || r.status === "IN_REVIEW").length;
              const rejectedRm = prod.rawMaterials.filter((r) => r.status === "REJECTED").length;
              const label = prod.labelApprovals[0];
              return (
                <div key={prod.id} className="rounded-xl border bg-white overflow-hidden">
                  <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                    <span className="font-medium">{prod.name}{prod.nameEn && ` / ${prod.nameEn}`}</span>
                    <div className="flex gap-2">
                      {pendingRm > 0 && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 rounded-full px-2 py-0.5">
                          {pendingRm} חומרי גלם ממתינים
                        </span>
                      )}
                      {rejectedRm > 0 && (
                        <span className="text-xs bg-red-100 text-red-700 rounded-full px-2 py-0.5">
                          {rejectedRm} נדחו
                        </span>
                      )}
                      {label && (
                        <span className={`text-xs rounded-full px-2 py-0.5 ${
                          label.status === "APPROVED" ? "bg-green-100 text-green-700" :
                          label.status === "REJECTED" ? "bg-red-100 text-red-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          תווית: {label.status === "APPROVED" ? "מאושרת" : label.status === "REJECTED" ? "נדחתה" : "ממתינה"}
                        </span>
                      )}
                    </div>
                  </div>
                  {prod.rawMaterials.length > 0 && (
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-start px-4 py-2 text-xs font-medium text-gray-500">חומר גלם</th>
                          <th className="text-start px-4 py-2 text-xs font-medium text-gray-500">ספק</th>
                          <th className="text-start px-4 py-2 text-xs font-medium text-gray-500">ארץ</th>
                          <th className="text-start px-4 py-2 text-xs font-medium text-gray-500">סטטוס</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {prod.rawMaterials.map((rm) => (
                          <tr key={rm.id}>
                            <td className="px-4 py-2">{rm.name}</td>
                            <td className="px-4 py-2 text-gray-500">{rm.supplier ?? "—"}</td>
                            <td className="px-4 py-2 text-gray-500">{rm.country ?? "—"}</td>
                            <td className="px-4 py-2">
                              <span className={`rounded-full px-2 py-0.5 text-xs ${
                                rm.status === "APPROVED" ? "bg-green-100 text-green-700" :
                                rm.status === "REJECTED" ? "bg-red-100 text-red-700" :
                                "bg-yellow-100 text-yellow-700"
                              }`}>
                                {RM_STATUS_LABELS[rm.status] ?? rm.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
