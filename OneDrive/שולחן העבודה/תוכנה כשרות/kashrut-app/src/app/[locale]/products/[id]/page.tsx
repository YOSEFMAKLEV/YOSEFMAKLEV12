import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById, getCertBodyRecommendation } from "@/actions/products";

const rawMaterialStatusLabels: Record<string, { label: string; color: string }> = {
  PENDING:    { label: "ממתין",    color: "bg-yellow-100 text-yellow-700" },
  APPROVED:   { label: "מאושר",   color: "bg-green-100 text-green-700" },
  REJECTED:   { label: "נדחה",    color: "bg-red-100 text-red-700" },
  IN_REVIEW:  { label: "בבדיקה",  color: "bg-blue-100 text-blue-700" },
  EXPIRED:    { label: "פג תוקף", color: "bg-orange-100 text-orange-700" },
  NEEDS_INFO: { label: "נדרש מידע",color: "bg-purple-100 text-purple-700" },
};

const labelStatusLabels: Record<string, { label: string; color: string }> = {
  PENDING:          { label: "ממתין",          color: "bg-yellow-100 text-yellow-700" },
  APPROVED:         { label: "מאושר",          color: "bg-green-100 text-green-700" },
  CHANGES_REQUESTED:{ label: "נדרשים תיקונים", color: "bg-orange-100 text-orange-700" },
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("he-IL").format(new Date(d));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, recommendation] = await Promise.all([
    getProductById(id).catch(() => null),
    getCertBodyRecommendation(id).catch(() => []),
  ]);
  if (!product) notFound();

  const certBodies = product.certBodyProducts.map(cbp => cbp.certBody);
  const activeCertBodyIds = new Set(certBodies.map(cb => cb.id));
  const total = product.rawMaterials.length;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 flex-wrap">
        <Link href="/clients" className="hover:text-gray-700">לקוחות</Link>
        <span>/</span>
        <Link href={`/clients/${product.site.clientId}`} className="hover:text-gray-700">{product.site.client.name}</Link>
        <span>/</span>
        <Link href={`/sites/${product.siteId}`} className="hover:text-gray-700">{product.site.name}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          {product.nameEn && <p className="text-gray-500 text-sm mt-0.5">{product.nameEn}</p>}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {product.category && (
              <span className="rounded-full bg-gray-100 text-gray-600 px-2.5 py-0.5 text-xs font-medium">{product.category}</span>
            )}
            {certBodies.map(cb => (
              <span key={cb.id} className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs font-medium">{cb.name}</span>
            ))}
          </div>
        </div>
        <Link href={`/products/${id}/edit`} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          עריכה
        </Link>
      </div>

      {/* Cert Body Recommendation */}
      {recommendation.length > 0 && (
        <div className="rounded-xl border bg-white p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">⭐</span>
            <h2 className="font-semibold text-gray-900">המלצת גוף כשרות</h2>
            <span className="text-xs text-gray-400 mr-auto">מבוסס על {total} חומרי גלם</span>
          </div>
          <div className="space-y-2.5">
            {recommendation.map((rec, i) => {
              const pct = total > 0 ? Math.round((rec.approved / total) * 100) : 0;
              const isActive = activeCertBodyIds.has(rec.id);
              const isBest = i === 0;
              return (
                <div key={rec.id} className={`rounded-lg p-3 border ${isActive ? "border-blue-200 bg-blue-50/60" : "border-gray-100 bg-gray-50"}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${isActive ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                      {rec.name.slice(0, 2)}
                    </div>
                    <p className="text-sm font-medium text-gray-900 flex-1">{rec.name}</p>
                    {isActive && <span className="text-[11px] bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 font-medium">פעיל</span>}
                    {isBest && !isActive && <span className="text-[11px] bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-medium">⭐ מומלץ</span>}
                    <span className={`text-sm font-bold ${pct >= 80 ? "text-green-600" : pct >= 50 ? "text-amber-600" : "text-red-500"}`}>
                      {pct}%
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex gap-3 mt-1.5 text-[11px] text-gray-500">
                    <span className="text-green-600 font-medium">✓ {rec.approved} מאושר</span>
                    {rec.pending > 0 && <span className="text-amber-600">⏳ {rec.pending} ממתין</span>}
                    {rec.rejected > 0 && <span className="text-red-500">✗ {rec.rejected} נדחה</span>}
                    {total - rec.approved - rec.pending - rec.rejected - rec.other > 0 && (
                      <span className="text-gray-400">— {total - rec.approved - rec.pending - rec.rejected - rec.other} ללא אישור</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {recommendation.length > 0 && recommendation[0].approved < total && (
            <p className="text-xs text-gray-400 mt-3">
              {total - recommendation[0].approved} חומרי גלם עדיין חסרים אישור אצל הגוף המומלץ
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Raw Materials */}
        <div className="rounded-xl border bg-white p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">חומרי גלם ({product.rawMaterials.length})</h2>
            <Link href={`/products/${id}/raw-materials/new`} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
              + הוסף
            </Link>
          </div>
          {product.rawMaterials.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">אין חומרי גלם</p>
          ) : (
            <div className="space-y-3">
              {product.rawMaterials.map(rm => {
                const status = rawMaterialStatusLabels[rm.status] ?? { label: rm.status, color: "bg-gray-100 text-gray-600" };
                return (
                  <div key={rm.id} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{rm.name}</p>
                        <p className="text-xs text-gray-400">{rm.supplier || "—"} · {rm.country || "—"}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>{status.label}</span>
                    </div>
                    {/* Per-cert-body approval pills */}
                    {rm.approvals.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {rm.approvals.map(appr => {
                          const colorMap: Record<string, string> = {
                            APPROVED:   "bg-green-50 text-green-700",
                            PENDING:    "bg-amber-50 text-amber-700",
                            REJECTED:   "bg-red-50 text-red-700",
                            IN_REVIEW:  "bg-blue-50 text-blue-700",
                            EXPIRED:    "bg-orange-50 text-orange-700",
                            NEEDS_INFO: "bg-purple-50 text-purple-700",
                          };
                          const s = colorMap[appr.status] ?? "bg-gray-100 text-gray-500";
                          return (
                            <span key={appr.certBodyId} className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${s}`}>
                              {appr.certBody.name}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Label Approvals */}
        <div className="rounded-xl border bg-white p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">אישורי תווית</h2>
            <Link href={`/products/${id}/labels/new`} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
              + גרסה חדשה
            </Link>
          </div>
          {product.labelApprovals.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">אין אישורי תווית</p>
          ) : (
            <div className="space-y-3">
              {product.labelApprovals.map(la => {
                const status = labelStatusLabels[la.status] ?? { label: la.status, color: "bg-gray-100 text-gray-600" };
                return (
                  <div key={la.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">גרסה {la.version}</p>
                      <p className="text-xs text-gray-400">{formatDate(la.createdAt)}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>{status.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
