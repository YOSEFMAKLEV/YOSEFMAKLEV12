import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPendingEditRequests } from "@/actions/profileEditRequests";
import { ProfileClient } from "@/components/mashgiach/ProfileClient";

const ORG_ID = "org_demo";

export default async function MashgiachProfilePage() {
  const session = await auth();
  const userId = session?.user?.id;

  const mashgiach = userId
    ? await prisma.mashgiach.findFirst({
        where: { userId },
        include: {
          levels: { include: { level: { select: { name: true, color: true } } } },
          certBodies: { include: { certBody: { select: { name: true } } } },
        },
      })
    : null;

  if (!mashgiach) redirect("/my-assignments");

  const pendingRequests = await getPendingEditRequests(mashgiach.id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">הפרופיל שלי</h1>
      <ProfileClient
        mashgiach={{
          id: mashgiach.id,
          organizationId: ORG_ID,
          name: mashgiach.name,
          nameEn: mashgiach.nameEn,
          phone: mashgiach.phone,
          email: mashgiach.email,
          city: mashgiach.city,
          citizenships: mashgiach.citizenships,
          languages: mashgiach.languages as Record<string, string> | null,
          activeRegions: mashgiach.activeRegions,
          levels: mashgiach.levels.map(l => ({ name: l.level.name, color: l.level.color })),
          certBodies: mashgiach.certBodies.map(cb => cb.certBody.name),
        }}
        pendingRequests={pendingRequests.map(r => ({
          id: r.id,
          requestType: r.requestType,
          field: r.field,
          oldValue: r.oldValue,
          newValue: r.newValue,
          createdAt: r.createdAt,
        }))}
      />
    </div>
  );
}
