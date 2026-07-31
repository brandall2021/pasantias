import { prisma } from "@/lib/prisma"

export class SeguroRepository {
  static upsert(
    postulacionId: string,
    data: {
      compania: string
      poliza: string
      coberturaDesde: Date
      coberturaHasta: Date
      archivo?: string
    },
  ) {
    return prisma.seguro.upsert({
      where: { postulacionId },
      update: { ...data },
      create: { ...data, postulacionId },
    })
  }

  static findByPostulacionId(postulacionId: string) {
    return prisma.seguro.findUnique({ where: { postulacionId } })
  }
}
