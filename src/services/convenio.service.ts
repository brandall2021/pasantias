import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"
import { crearNotificacion } from "@/lib/notificacion"

export class ConvenioService {
  static async obtenerPorPostulacion(postulacionId: string) {
    return prisma.convenio.findUnique({
      where: { postulacionId },
      include: { seguimientos: { orderBy: { fecha: "desc" } }, evaluaciones: true },
    })
  }

  static async firmar(
    postulacionId: string,
    parte: "alumno" | "empresa" | "universidad",
    usuarioId: string,
  ) {
    const postulacion = await prisma.postulacion.findUnique({
      where: { id: postulacionId },
      include: {
        pasantia: { select: { titulo: true, empresaId: true } },
        alumno: { select: { id: true } },
      },
    })
    if (!postulacion) throw new Error("Postulación no encontrada")

    // Find or create convenio
    let convenio = await prisma.convenio.findUnique({ where: { postulacionId } })
    if (!convenio) {
      convenio = await prisma.convenio.create({
        data: { postulacionId },
      })
    }

    const updateData: Record<string, boolean> = {}
    const parteMap: Record<string, string> = {
      alumno: "firmaAlumno",
      empresa: "firmaEmpresa",
      universidad: "firmaUniversidad",
    }
    updateData[parteMap[parte]] = true

    convenio = await prisma.convenio.update({
      where: { id: convenio.id },
      data: updateData,
    })

    // Check if all signed -> mark COMPLETADO
    if (convenio.firmaAlumno && convenio.firmaEmpresa && convenio.firmaUniversidad) {
      await prisma.convenio.update({
        where: { id: convenio.id },
        data: { estado: "COMPLETADO" },
      })
    }

    await logAudit(usuarioId, "FIRMAR_CONVENIO",
      `${parte} firmó convenio para: ${postulacion.pasantia.titulo}`,
      "Convenio", convenio.id)

    // Notificar a los demás participantes
    const tituloP = postulacion.pasantia.titulo
    await crearNotificacion({
      usuarioId: postulacion.alumno.id,
      titulo: "Firma de convenio",
      mensaje: `La ${parte === "alumno" ? "empresa" : parte} firmó el convenio para "${tituloP}"`,
      link: "/universidad",
    })

    const empresaUsers = await prisma.user.findMany({
      where: { empresaId: postulacion.pasantia.empresaId, deletedAt: null },
      select: { id: true },
    })
    for (const u of empresaUsers) {
      if (u.id !== usuarioId) {
        await crearNotificacion({
          usuarioId: u.id,
          titulo: "Firma de convenio",
          mensaje: `La ${parte} firmó el convenio para "${tituloP}"`,
          link: "/perfil/pasantias",
        })
      }
    }

    const universidadPostulacion = await prisma.postulacion.findUnique({
      where: { id: postulacionId },
      select: {
        pasantia: {
          select: {
            unidadAcademica: {
              select: { universidad: { select: { id: true } } },
            },
          },
        },
      },
    })
    const univId = universidadPostulacion?.pasantia.unidadAcademica?.universidad?.id
    if (univId) {
      const univUsers = await prisma.user.findMany({
        where: { universidadId: univId, deletedAt: null },
        select: { id: true },
      })
      for (const u of univUsers) {
        if (u.id !== usuarioId) {
          await crearNotificacion({
            usuarioId: u.id,
            titulo: "Firma de convenio",
            mensaje: `La ${parte} firmó el convenio para "${tituloP}"`,
            link: "/universidad",
          })
        }
      }
    }

    // All signed -> notify everyone
    if (convenio.firmaAlumno && convenio.firmaEmpresa && convenio.firmaUniversidad) {
      await crearNotificacion({
        usuarioId: postulacion.alumno.id,
        titulo: "Convenio completado",
        mensaje: `El convenio para "${tituloP}" fue firmado por todas las partes`,
        link: "/perfil/postulaciones",
      })
    }

    return convenio
  }

  static async agregarSeguimiento(
    postulacionId: string,
    descripcion: string,
    usuarioId: string,
  ) {
    let convenio = await prisma.convenio.findUnique({ where: { postulacionId } })
    if (!convenio) {
      convenio = await prisma.convenio.create({ data: { postulacionId } })
    }

    const seguimiento = await prisma.seguimiento.create({
      data: {
        convenioId: convenio.id,
        descripcion,
        usuarioId,
      },
    })

    await logAudit(usuarioId, "AGREGAR_SEGUIMIENTO", descripcion, "Seguimiento", seguimiento.id)
    return seguimiento
  }

  static async evaluar(
    postulacionId: string,
    tipo: "EMPRESA_A_ALUMNO" | "ALUMNO_A_EMPRESA" | "TUTOR",
    puntaje: number,
    comentario: string | undefined,
    autorId: string,
  ) {
    let convenio = await prisma.convenio.findUnique({ where: { postulacionId } })
    if (!convenio) {
      convenio = await prisma.convenio.create({ data: { postulacionId } })
    }

    const evaluacion = await prisma.evaluacion.create({
      data: {
        convenioId: convenio.id,
        tipo,
        puntaje,
        comentario,
        autorId,
      },
    })

    await logAudit(autorId, "EVALUAR", `Evaluación ${tipo}: ${puntaje}pts`, "Evaluacion", evaluacion.id)
    return evaluacion
  }
}
