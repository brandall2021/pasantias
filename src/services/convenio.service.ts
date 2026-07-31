import { logAudit } from "@/lib/audit"
import { crearNotificacion } from "@/lib/notificacion"
import { ConvenioRepository } from "@/repositories/convenio.repository"
import { PostulacionRepository } from "@/repositories/postulacion.repository"
import { UserRepository } from "@/repositories/user.repository"

export class ConvenioService {
  static async obtenerPorPostulacion(postulacionId: string) {
    return ConvenioRepository.findByPostulacionId(postulacionId)
  }

  static async firmar(
    postulacionId: string,
    parte: "alumno" | "empresa" | "universidad",
    usuarioId: string,
  ) {
    const postulacion = await PostulacionRepository.findByIdConPasantiaEmpresa(postulacionId)
    if (!postulacion) throw new Error("Postulación no encontrada")

    // Find or create convenio
    let convenio = await ConvenioRepository.findByPostulacionId(postulacionId)
    if (!convenio) {
      const nuevo = await ConvenioRepository.create(postulacionId)
      convenio = { ...nuevo, seguimientos: [], evaluaciones: [] }
    }

    const updateData: Record<string, boolean> = {}
    const parteMap: Record<string, string> = {
      alumno: "firmaAlumno",
      empresa: "firmaEmpresa",
      universidad: "firmaUniversidad",
    }
    updateData[parteMap[parte]] = true

    await ConvenioRepository.update(convenio.id, updateData)
    const actualizado = await ConvenioRepository.findByPostulacionId(postulacionId)
    if (actualizado) convenio = actualizado

    // Check if all signed -> mark COMPLETADO
    if (convenio.firmaAlumno && convenio.firmaEmpresa && convenio.firmaUniversidad) {
      await ConvenioRepository.update(convenio.id, { estado: "COMPLETADO" })
    }

    await logAudit(
      usuarioId,
      "FIRMAR_CONVENIO",
      `${parte} firmó convenio para: ${postulacion.pasantia.titulo}`,
      "Convenio",
      convenio.id
    )

    // Notificar a los demás participantes
    const tituloP = postulacion.pasantia.titulo
    await crearNotificacion({
      usuarioId: postulacion.alumno.id,
      titulo: "Firma de convenio",
      mensaje: `La ${parte === "alumno" ? "empresa" : parte} firmó el convenio para "${tituloP}"`,
      link: "/universidad",
    })

    const empresaUsers = await UserRepository.findIdPorEmpresa(postulacion.pasantia.empresaId)
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

    const universidadPostulacion = await PostulacionRepository.findByIdConUnidadAcademica(postulacionId)
    const univId = universidadPostulacion?.pasantia.unidadAcademica?.universidad?.id
    if (univId) {
      const univUsers = await UserRepository.findIdPorUniversidad(univId)
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

  static async agregarSeguimiento(postulacionId: string, descripcion: string, usuarioId: string) {
    let convenio = await ConvenioRepository.findByPostulacionId(postulacionId)
    if (!convenio) {
      const nuevo = await ConvenioRepository.create(postulacionId)
      convenio = { ...nuevo, seguimientos: [], evaluaciones: [] }
    }

    const seguimiento = await ConvenioRepository.crearSeguimiento({
      convenioId: convenio.id,
      descripcion,
      usuarioId,
    })

    await logAudit(usuarioId, "AGREGAR_SEGUIMIENTO", descripcion, "Seguimiento", seguimiento.id)
    return seguimiento
  }

  static async evaluar(
    postulacionId: string,
    tipo:
      | "EMPRESA_A_ALUMNO"
      | "ALUMNO_A_EMPRESA"
      | "TUTOR"
      | "INTERMEDIO_ALUMNO"
      | "INTERMEDIO_EMPRESA"
      | "FINAL_ALUMNO"
      | "FINAL_EMPRESA",
    puntaje: number,
    comentario: string | undefined,
    autorId: string,
  ) {
    let convenio = await ConvenioRepository.findByPostulacionId(postulacionId)
    if (!convenio) {
      const nuevo = await ConvenioRepository.create(postulacionId)
      convenio = { ...nuevo, seguimientos: [], evaluaciones: [] }
    }

    const evaluacion = await ConvenioRepository.crearEvaluacion({
      convenioId: convenio.id,
      tipo,
      puntaje,
      comentario,
      autorId,
    })

    await logAudit(autorId, "EVALUAR", `Evaluación ${tipo}: ${puntaje}pts`, "Evaluacion", evaluacion.id)
    return evaluacion
  }
}
