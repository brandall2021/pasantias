import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export class UniversidadRepository {
  static findAllNombre() {
    return prisma.universidad.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    })
  }

  static findById(id: string) {
    return prisma.universidad.findUnique({ where: { id } })
  }

  static create(data: Prisma.UniversidadUncheckedCreateInput) {
    return prisma.universidad.create({ data })
  }

  static findFacultadesIds(id: string) {
    return prisma.universidad.findUnique({
      where: { id },
      select: { facultades: { select: { id: true } } },
    })
  }

  static findFacultadesConNombre(id: string) {
    return prisma.universidad.findUnique({
      where: { id },
      select: { facultades: { select: { id: true, nombre: true } } },
    })
  }
}
