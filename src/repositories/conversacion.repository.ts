import { prisma } from "@/lib/prisma"

export class ConversacionRepository {
  static findByPostulacionId(postulacionId: string) {
    return prisma.conversacion.findUnique({ where: { postulacionId } })
  }

  static create(postulacionId: string) {
    return prisma.conversacion.create({ data: { postulacionId } })
  }

  static touch(id: string) {
    return prisma.conversacion.update({
      where: { id },
      data: { updatedAt: new Date() },
    })
  }

  static findByIdConParticipantes(id: string) {
    return prisma.conversacion.findUnique({
      where: { id },
      include: {
        postulacion: {
          select: {
            alumnoId: true,
            pasantia: {
              select: { empresa: { select: { usuarios: { select: { id: true } } } } },
            },
          },
        },
      },
    })
  }

  static findAllParaUsuario(usuarioId: string) {
    return prisma.conversacion.findMany({
      where: {
        postulacion: {
          OR: [
            { alumnoId: usuarioId },
            { pasantia: { empresa: { usuarios: { some: { id: usuarioId } } } } },
          ],
        },
      },
      include: {
        postulacion: {
          select: {
            id: true,
            alumnoId: true,
            pasantia: { select: { titulo: true, empresa: { select: { nombre: true } } } },
          },
        },
        mensajes: { orderBy: { fecha: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    })
  }

  static mensajes(conversacionId: string) {
    return prisma.mensaje.findMany({
      where: { conversacionId },
      include: { autor: { select: { id: true, name: true, image: true } } },
      orderBy: { fecha: "asc" },
    })
  }

  static crearMensaje(data: { conversacionId: string; autorId: string; texto: string }) {
    return prisma.mensaje.create({
      data,
      include: { autor: { select: { id: true, name: true, image: true } } },
    })
  }
}
