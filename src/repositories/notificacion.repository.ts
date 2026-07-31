import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export class NotificacionRepository {
  static create(data: Prisma.NotificacionUncheckedCreateInput) {
    return prisma.notificacion.create({ data })
  }

  static findByUsuarioId(usuarioId: string, take = 50) {
    return prisma.notificacion.findMany({
      where: { usuarioId },
      orderBy: { createdAt: "desc" },
      take,
    })
  }

  static countNoLeidas(usuarioId: string) {
    return prisma.notificacion.count({ where: { usuarioId, leida: false } })
  }

  static marcarLeida(id: string, usuarioId: string) {
    return prisma.notificacion.updateMany({
      where: { id, usuarioId },
      data: { leida: true },
    })
  }

  static marcarTodasLeidas(usuarioId: string) {
    return prisma.notificacion.updateMany({
      where: { usuarioId, leida: false },
      data: { leida: true },
    })
  }
}
