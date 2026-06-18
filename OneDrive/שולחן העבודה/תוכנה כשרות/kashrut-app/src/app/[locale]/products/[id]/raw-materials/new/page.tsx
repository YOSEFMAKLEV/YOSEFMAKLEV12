import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/actions/products";
import { NewRawMaterialForm } from "@/components/raw-materials/NewRawMaterialForm";

export default async function NewRawMaterialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id).catch(() => null);
  if (!product) notFound();

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/products" className="hover:text-gray-700">מוצרים</Link>
        <span>/</span>
        <Link href={`/products/${id}`} className="hover:text-gray-700">{product.name}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">הוספת חומר גלם</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">הוספת חומר גלם</h1>

      <NewRawMaterialForm productId={id} productName={product.name} />
    </div>
  );
}
