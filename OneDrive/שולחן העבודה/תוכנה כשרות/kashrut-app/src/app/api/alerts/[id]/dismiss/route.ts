import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, ctx: RouteContext<'/api/alerts/[id]/dismiss'>) {
  const { id } = await ctx.params;
  await prisma.alert.update({ where: { id }, data: { isDismissed: true } });
  return Response.json({ ok: true });
}
