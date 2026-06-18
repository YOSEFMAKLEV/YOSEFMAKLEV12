import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { NewHologramBatchForm } from "@/components/holograms/NewHologramBatchForm";

const ORG_ID = "org_demo";

export default async function NewHologramBatchPage() {
  const certBodies = await prisma.certBody.findMany({
    where: { organizationId: ORG_ID, isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/holograms" className="hover:text-gray-700">הולוגרמות</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">קבלת מנה חדשה</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">קבלת מנת הולוגרמות</h1>
      <NewHologramBatchForm certBodies={certBodies} />
    </div>
  );
}
