import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUnique({ where: { email: "mashgiach@kashrut.com" } });
  if (!user) { console.log("No user found"); return; }
  console.log("User:", user.id, user.email, "org:", user.organizationId);

  // Check if already linked
  const existing = await prisma.mashgiach.findFirst({ where: { userId: user.id } });
  if (existing) {
    console.log("Already linked:", existing.name);
    return;
  }

  // Create a demo mashgiach record
  const mashgiach = await prisma.mashgiach.create({
    data: {
      organizationId: user.organizationId,
      name: "יוסף משגיח (דמו)",
      nameEn: "Yosef Mashgiach (Demo)",
      email: user.email ?? undefined,
      userId: user.id,
      activeRegions: ["IL", "US"],
      citizenships: ["IL"],
    },
  });
  console.log("Created mashgiach:", mashgiach.id, mashgiach.name);

  await prisma.$disconnect();
}

main().catch(console.error);
