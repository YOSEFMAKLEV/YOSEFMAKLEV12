import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
async function main() {
  const orgs = await prisma.organization.findMany({ select: { id: true, name: true } });
  const projects = await prisma.project.findMany({ include: { client: { select: { name: true } }, site: { select: { name: true } } }, take: 5 });
  console.log("ORGS:", JSON.stringify(orgs));
  console.log("PROJECTS:", projects.length, JSON.stringify(projects.map(p => ({ id: p.id, client: p.client.name, site: p.site.name, status: p.status }))));
  await prisma.$disconnect();
}
main().catch(console.error);
