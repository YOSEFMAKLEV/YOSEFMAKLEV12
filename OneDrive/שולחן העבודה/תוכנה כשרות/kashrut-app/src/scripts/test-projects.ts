import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const now = new Date();
  try {
    const projects = await prisma.project.findMany({
      where: { organizationId: "org_demo" },
      include: {
        client: { select: { id: true, name: true } },
        site: { select: { id: true, name: true, country: true } },
        certBody: { select: { id: true, name: true } },
        dealer: { select: { id: true, name: true } },
        assignments: {
          where: { scheduledAt: { gte: now } },
          orderBy: { scheduledAt: "asc" },
          take: 1,
          include: { mashgiach: { select: { id: true, name: true } } },
        },
        checklistItems: { select: { isCompleted: true } },
        _count: { select: { assignments: true, certificates: true } },
      },
      orderBy: { openedAt: "desc" },
    });
    console.log("SUCCESS. Count:", projects.length);
    console.log("Sample:", JSON.stringify(projects[0], null, 2));
  } catch (e) {
    console.error("ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
