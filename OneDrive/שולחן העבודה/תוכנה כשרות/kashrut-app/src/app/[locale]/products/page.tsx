import Link from "next/link";
import { getProducts } from "@/actions/products";

const ORG_ID = "org_demo";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const products = await getProducts(ORG_ID, q).catch(() => []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">מוצרים</h1>
        <Link
          href="/products/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + מוצר חדש
        </Link>
      </div>

      <div className="mb-4">
        <form>
          <input
            name="q"
            defaultValue={q}
            placeholder="חיפוש לפי שם, קטגוריה..."
            className="w-full max-w-sm rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-start px-4 py-3 font-medium text-gray-600">שם מוצר</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">מפעל</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">קטגוריה</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">גוף כשרות</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600">ח"ג</th>
              <th className="text-start px-4 py-3 font-medium text-gray-600"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  אין מוצרים —{" "}
                  <Link href="/products/new" className="text-blue-600 hover:underline">
                    הוסף את הראשון
                  </Link>
                </td>
              </tr>
            )}
            {products.map((product) => {
              const certBodies = product.certBodyProducts.map((cbp) => cbp.certBody.name).join(", ");

              return (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      {product.nameEn && <p className="text-xs text-gray-400">{product.nameEn}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/sites/${product.site.id}`} className="text-blue-600 hover:underline">
                      {product.site.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{product.category || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{certBodies || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{product._count.rawMaterials}</td>
                  <td className="px-4 py-3">
                    <Link href={`/products/${product.id}`} className="text-blue-600 hover:underline text-xs">
                      פתח
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
