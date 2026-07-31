import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export class EmpresaRepository {
  static findAllResumen() {
    return prisma.empresa.findMany({
      select: { id: true, nombre: true, cuit: true, estado: true },
      orderBy: { nombre: "asc" },
    })
  }

  static findAllNombre() {
    return prisma.empresa.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    })
  }

  static findById(id: string) {
    return prisma.empresa.findUnique({ where: { id } })
  }

  static create(data: Prisma.EmpresaUncheckedCreateInput) {
    return prisma.empresa.create({ data })
  }

  static update(id: string, data: Prisma.EmpresaUncheckedUpdateInput) {
    return prisma.empresa.update({ where: { id }, data })
  }
}
