import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"

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

    const updateData: any = {}
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
    tipo: string,
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
        tipo: tipo as any,
        puntaje,
        comentario,
        autorId,
      },
    })

    await logAudit(autorId, "EVALUAR", `Evaluación ${tipo}: ${puntaje}pts`, "Evaluacion", evaluacion.id)
    return evaluacion
  }
}
