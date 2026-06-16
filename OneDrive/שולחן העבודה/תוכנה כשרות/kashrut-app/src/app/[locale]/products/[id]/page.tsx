import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/actions/products";

const rawMaterialStatusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "ממתין לאישור", color: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "מאושר", color: "bg-green-100 text-green-700" },
  REJECTED: { label: "נדחה", color: "bg-red-100 text-red-700" },
};

const labelStatusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "ממתין", color: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "מאושר", color: "bg-green-100 text-green-700" },
  CHANGES_REQUESTED: { label: "נדרשים תיקונים", color: "bg-orange-100 text-orange-700" },
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("he-IL").format(new Date(d));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id).catch(() => null);
  if (!product) notFound();

  const certBodies = product.certBodyProducts.map((cbp) => cbp.certBody);

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
            {certBodies.map((cb) => (
              <span key={cb.id} className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs font-medium">{cb.name}</span>
            ))}
          </div>
        </div>
        <Link href={`/products/${id}/edit`} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          עריכה
        </Link>
      </div>

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
              {product.rawMaterials.map((rm) => {
                const status = rawMaterialStatusLabels[rm.status] ?? { label: rm.status, color: "bg-gray-100 text-gray-600" };
                return (
                  <div key={rm.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{rm.name}</p>
                      <p className="text-xs text-gray-400">{rm.supplier || "—"} · {rm.country || "—"}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>{status.label}</span>
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
              {product.labelApprovals.map((la) => {
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
