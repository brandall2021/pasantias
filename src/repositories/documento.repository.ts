import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export class DocumentoRepository {
  static findByUsuarioId(usuarioId: string) {
    return prisma.documento.findMany({
      where: { usuarioId },
      orderBy: { createdAt: "desc" },
    })
  }

  static create(data: Prisma.DocumentoUncheckedCreateInput) {
    return prisma.documento.create({ data })
  }

  static createMany(data: Prisma.DocumentoUncheckedCreateInput[]) {
    return prisma.documento.createMany({ data })
  }

  static findById(id: string) {
    return prisma.documento.findUnique({ where: { id } })
  }

  static delete(id: string) {
    return prisma.documento.delete({ where: { id } })
  }
}
