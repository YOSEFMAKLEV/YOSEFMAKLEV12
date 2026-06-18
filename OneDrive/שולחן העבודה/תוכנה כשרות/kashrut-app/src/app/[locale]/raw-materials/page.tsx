import { getAllRawMaterials } from "@/actions/products";
import { getCertBodies } from "@/actions/settings";
import { RawMaterialsList } from "@/components/raw-materials/RawMaterialsList";

export const dynamic = "force-dynamic";

const ORG_ID = "org_demo";

export default async function RawMaterialsPage() {
  const [items, certBodies] = await Promise.all([
    getAllRawMaterials(ORG_ID).catch((e) => { console.error("getAllRawMaterials error:", e); return []; }),
    getCertBodies(ORG_ID).catch((e) => { console.error("getCertBodies error:", e); return []; }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">חומרי גלם</h1>
          <p className="text-sm text-gray-500 mt-0.5">כל חומרי הגלם מכלל המוצרים</p>
        </div>
      </div>
      <RawMaterialsList
        items={items as Parameters<typeof RawMaterialsList>[0]["items"]}
        certBodies={certBodies.map(cb => ({ id: cb.id, name: cb.name }))}
      />
    </div>
  );
}
