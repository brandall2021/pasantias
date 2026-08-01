import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export class ConvenioMarcoRepository {
  static findByUniversidadYEmpresa(universidadId: string, empresaId: string) {
    return prisma.convenioMarco.findUnique({
      where: { universidadId_empresaId: { universidadId, empresaId } },
    })
  }

  static create(data: Prisma.ConvenioMarcoUncheckedCreateInput) {
    return prisma.convenioMarco.create({ data })
  }

  static findByUniversidadId(universidadId: string, empresaId?: string) {
    return prisma.convenioMarco.findMany({
      where: { universidadId, ...(empresaId ? { empresaId } : {}) },
      include: { empresa: { select: { nombre: true } } },
      orderBy: { createdAt: "desc" },
    })
  }

  static findByEmpresaId(empresaId: string, empresaFiltro?: string) {
    return prisma.convenioMarco.findMany({
      where: { empresaId, ...(empresaFiltro ? { empresaId: empresaFiltro } : {}) },
      include: { universidad: { select: { nombre: true } } },
      orderBy: { createdAt: "desc" },
    })
  }

  static update(id: string, data: Prisma.ConvenioMarcoUncheckedUpdateInput) {
    return prisma.convenioMarco.update({ where: { id }, data })
  }
}
