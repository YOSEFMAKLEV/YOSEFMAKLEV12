import Link from "next/link";
import { NewProductForm } from "@/components/products/NewProductForm";
import { getSites } from "@/actions/sites";

const ORG_ID = "org_demo";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ siteId?: string; clientId?: string }>;
}) {
  const { siteId, clientId } = await searchParams;
  const sites = await getSites(ORG_ID).catch(() => []);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/products" className="hover:text-gray-700">מוצרים</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">מוצר חדש</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">הוספת מוצר חדש</h1>
      <NewProductForm sites={sites} defaultSiteId={siteId} defaultClientId={clientId} />
    </div>
  );
}
