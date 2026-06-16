"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProducts(organizationId: string, search?: string) {
  return prisma.product.findMany({
    where: {
      organizationId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { nameEn: { contains: search, mode: "insensitive" } },
              { category: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      site: { select: { id: true, name: true } },
      certBodyProducts: { include: { certBody: true } },
      _count: { select: { rawMaterials: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      site: { include: { client: true } },
      certBodyProducts: { include: { certBody: true } },
      rawMaterials: { orderBy: { name: "asc" } },
      labelApprovals: { orderBy: { version: "desc" } },
    },
  });
}

export async function createProduct(data: {
  organizationId: string;
  siteId: string;
  clientId: string;
  name: string;
  nameEn?: string;
  category?: string;
  createdByUserId?: string;
}) {
  const product = await prisma.product.create({ data });
  revalidatePath("/products");
  return product;
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    nameEn: string;
    category: string;
  }>
) {
  const product = await prisma.product.update({ where: { id }, data });
  revalidatePath(`/products/${id}`);
  return product;
}
