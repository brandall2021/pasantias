import { prisma } from "@/lib/prisma"

export class FacultadRepository {
  static findAll(universidadId?: string) {
    return prisma.facultad.findMany({
      where: universidadId ? { universidadId } : {},
      include: { universidad: { select: { nombre: true } } },
      orderBy: { nombre: "asc" },
    })
  }
}
