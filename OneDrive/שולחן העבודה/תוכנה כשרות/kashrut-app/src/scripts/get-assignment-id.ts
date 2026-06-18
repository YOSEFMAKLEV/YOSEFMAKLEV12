import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const a = await prisma.assignment.findFirst({ include: { site: true } });
  console.log(JSON.stringify({ id: a?.id, site: a?.site?.name, addr: a?.site?.address, lat: a?.site?.latitude }));
  await prisma.$disconnect();
}
main().catch(console.error);
