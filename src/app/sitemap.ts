import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const BASE_URL = "https://pasantias.softgroup.com.ar"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pasantias = await prisma.pasantia.findMany({
    where: { activo: true, estado: "PUBLICADA" },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  })

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/pasantias`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...pasantias.map((p) => ({
      url: `${BASE_URL}/pasantias/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ]
}
