import { crearNotificacion } from "@/lib/notificacion"
import { ConvenioRepository } from "@/repositories/convenio.repository"
import { PlanTrabajoRepository } from "@/repositories/planTrabajo.repository"

export class PlanTrabajoService {
  static async crear(data: {
    convenioId: string
    objetivos: string
    horasSemana: number
    fechaInicio: Date
    fechaFin: Date
    usuarioId: string
  }) {
    if (data.fechaInicio >= data.fechaFin) {
      throw new Error("La fecha de inicio debe ser anterior a la fecha de fin")
    }
    if (data.horasSemana <= 0 || data.horasSemana > 40) {
      throw new Error("Las horas semanales deben estar entre 1 y 40")
    }
    return PlanTrabajoRepository.create(data)
  }

  static async obtenerPorConvenio(convenioId: string) {
    return PlanTrabajoRepository.findByConvenioId(convenioId)
  }

  static async registrarHoras(data: {
    convenioId: string
    horas: number
    descripcion?: string
    usuarioId: string
    fecha?: Date
  }) {
    const fecha = data.fecha || new Date()

    const plan = await PlanTrabajoRepository.findUltimoPlan(data.convenioId)
    if (!plan) {
      throw new Error("No existe un plan de trabajo para registrar horas")
    }
    if (fecha < plan.fechaInicio || fecha > plan.fechaFin) {
      throw new Error("La fecha del registro está fuera del rango del plan de trabajo")
    }

    const duplicado = await PlanTrabajoRepository.findRegistroDuplicado(
      data.convenioId,
      data.usuarioId,
      fecha
    )
    if (duplicado) {
      throw new Error("Ya registraste horas este día")
    }

    const registro = await PlanTrabajoRepository.crearRegistroHoras({
      convenioId: data.convenioId,
      horas: data.horas,
      descripcion: data.descripcion,
      usuarioId: data.usuarioId,
      fecha,
    })

    const convenio = await ConvenioRepository.findByIdConPostulacion(data.convenioId)

    if (convenio) {
      const receptores = [
        convenio.postulacion.alumnoId,
        convenio.postulacion.tutorAcademicoId,
        convenio.postulacion.tutorEmpresaId,
      ].filter(Boolean)

      for (const uid of receptores) {
        if (uid !== data.usuarioId) {
          await crearNotificacion({
            usuarioId: uid!,
            titulo: "Horas registradas",
            mensaje: `${data.horas}h registradas en "${convenio.postulacion.pasantia.titulo}"`,
            link: "/tutor-academico",
          })
        }
      }
    }

    return registro
  }

  static async horasPorConvenio(convenioId: string) {
    return PlanTrabajoRepository.findRegistrosHoras(convenioId)
  }

  static async totalHoras(convenioId: string) {
    return PlanTrabajoRepository.totalHoras(convenioId)
  }
}
