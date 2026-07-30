import { prisma } from "@/lib/prisma"

export async function crearNotificacion({
  usuarioId,
  titulo,
  mensaje,
  link,
}: {
  usuarioId: string
  titulo: string
  mensaje?: string
  link?: string
}) {
  return prisma.notificacion.create({
    data: { usuarioId, titulo, mensaje, link },
  })
}

export async function contarNoLeidas(usuarioId: string) {
  return prisma.notificacion.count({
    where: { usuarioId, leida: false },
  })
}

export async function marcarLeida(id: string, usuarioId: string) {
  return prisma.notificacion.updateMany({
    where: { id, usuarioId },
    data: { leida: true },
  })
}

export async function marcarTodasLeidas(usuarioId: string) {
  return prisma.notificacion.updateMany({
    where: { usuarioId, leida: false },
    data: { leida: true },
  })
}
