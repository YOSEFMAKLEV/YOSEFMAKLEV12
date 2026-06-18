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
      rawMaterials: {
        orderBy: { name: "asc" },
        include: {
          approvals: { include: { certBody: { select: { id: true, name: true } } } },
        },
      },
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

export async function getAllRawMaterials(organizationId: string) {
  return prisma.rawMaterial.findMany({
    where: { product: { organizationId } },
    include: {
      approvals: {
        include: { certBody: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
      product: {
        select: {
          id: true,
          name: true,
          site: { select: { id: true, name: true, country: true } },
          certBodyProducts: { include: { certBody: { select: { id: true, name: true } } } },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function updateRawMaterialFiles(
  id: string,
  data: {
    certificateFile?: string | null;
    imageUrl?: string | null;
    requiresKosherSymbol?: boolean;
    factorySpecific?: boolean;
    kosherType?: string;
    certificateIssuedBy?: string | null;
  }
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await prisma.rawMaterial.update({ where: { id }, data: data as any });
  revalidatePath("/raw-materials");
  return updated;
}

export async function upsertRawMaterialApproval(
  rawMaterialId: string,
  certBodyId: string,
  data: {
    status: string;
    approvedBy?: string | null;
    approvedAt?: Date | null;
    expiresAt?: Date | null;
    notes?: string | null;
    yearRound?: boolean;
    passover?: boolean;
    kitniyot?: boolean;
    classificationOverride?: string | null;
  }
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = data as any;
  await prisma.rawMaterialApproval.upsert({
    where: { rawMaterialId_certBodyId: { rawMaterialId, certBodyId } },
    create: { rawMaterialId, certBodyId, ...d },
    update: d,
  });
  revalidatePath("/raw-materials");
}

export async function deleteRawMaterialApproval(rawMaterialId: string, certBodyId: string) {
  await prisma.rawMaterialApproval.delete({
    where: { rawMaterialId_certBodyId: { rawMaterialId, certBodyId } },
  });
  revalidatePath("/raw-materials");
}

export async function getCertBodyRecommendation(productId: string) {
  const rawMaterials = await prisma.rawMaterial.findMany({
    where: { productId },
    include: {
      approvals: { include: { certBody: { select: { id: true, name: true } } } },
    },
  });

  const total = rawMaterials.length;
  const map = new Map<string, { name: string; approved: number; pending: number; rejected: number; other: number }>();

  for (const rm of rawMaterials) {
    for (const appr of rm.approvals) {
      if (!map.has(appr.certBodyId)) {
        map.set(appr.certBodyId, { name: appr.certBody.name, approved: 0, pending: 0, rejected: 0, other: 0 });
      }
      const entry = map.get(appr.certBodyId)!;
      if (appr.status === "APPROVED") entry.approved++;
      else if (appr.status === "PENDING") entry.pending++;
      else if (appr.status === "REJECTED") entry.rejected++;
      else entry.other++;
    }
  }

  return Array.from(map.entries())
    .map(([id, v]) => ({ id, ...v, total }))
    .sort((a, b) => b.approved - a.approved);
}

export async function createRawMaterial(data: {
  productId: string;
  name: string;
  supplier?: string;
  country?: string;
  kosherType?: string;
  certificateIssuedBy?: string;
  notes?: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rm = await prisma.rawMaterial.create({ data: data as any });
  revalidatePath(`/products/${data.productId}`);
  revalidatePath("/raw-materials");
  return rm;
}

export async function updateProduct(
  id: string,
  data: Partial<{ name: string; nameEn: string; category: string }>
) {
  const product = await prisma.product.update({ where: { id }, data });
  revalidatePath(`/products/${id}`);
  return product;
}
