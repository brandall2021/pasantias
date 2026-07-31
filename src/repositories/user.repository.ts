import { prisma } from "@/lib/prisma"
import type { Prisma, Role } from "@prisma/client"

export class UserRepository {
  static findById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  }

  static findByIdConInstituciones(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { empresa: true, universidad: true, carrera: true },
    })
  }

  static findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  }

  static findActivos(role?: Role) {
    const where: Prisma.UserWhereInput = { deletedAt: null, baneado: false }
    if (role) where.role = role
    return prisma.user.findMany({
      where,
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })
  }

  static findIdPorEmpresa(empresaId: string) {
    return prisma.user.findMany({
      where: { empresaId, deletedAt: null },
      select: { id: true },
    })
  }

  static findIdPorUniversidad(universidadId: string) {
    return prisma.user.findMany({
      where: { universidadId, deletedAt: null },
      select: { id: true },
    })
  }

  static create(data: Prisma.UserUncheckedCreateInput) {
    return prisma.user.create({ data })
  }

  static update(id: string, data: Prisma.UserUncheckedUpdateInput) {
    return prisma.user.update({ where: { id }, data })
  }
}
