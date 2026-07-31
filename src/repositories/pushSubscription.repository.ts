import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export class PushSubscriptionRepository {
  static findByEndpoint(endpoint: string) {
    return prisma.pushSubscription.findUnique({ where: { endpoint } })
  }

  static update(endpoint: string, data: Prisma.PushSubscriptionUncheckedUpdateInput) {
    return prisma.pushSubscription.update({ where: { endpoint }, data })
  }

  static create(data: Prisma.PushSubscriptionUncheckedCreateInput) {
    return prisma.pushSubscription.create({ data })
  }

  static deleteByEndpointYUsuario(endpoint: string, usuarioId: string) {
    return prisma.pushSubscription.deleteMany({ where: { endpoint, usuarioId } })
  }

  static deleteByEndpoint(endpoint: string) {
    return prisma.pushSubscription.deleteMany({ where: { endpoint } })
  }

  static findByUsuarioId(usuarioId: string) {
    return prisma.pushSubscription.findMany({ where: { usuarioId } })
  }
}
