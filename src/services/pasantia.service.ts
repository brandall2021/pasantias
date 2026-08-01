import { logAudit } from "@/lib/audit"
import { sendEmail, pasantiaNotificationEmail } from "@/lib/email"
import { PasantiaRepository } from "@/repositories/pasantia.repository"
import { PostulacionRepository } from "@/repositories/postulacion.repository"
import type { EstadoPasantia } from "@prisma/client"

const ESTADO_TRANSITIONS: Record<string, string[]> = {
  BORRADOR: ["PUBLICADA", "CANCELADA"],
  PUBLICADA: ["SELECCION", "CANCELADA"],
  SELECCION: ["ESPERA_CONVENIO", "CANCELADA"],
  ESPERA_CONVENIO: ["ACTIVA", "CANCELADA"],
  ACTIVA: ["FINALIZADA", "CANCELADA"],
  FINALIZADA: [],
  CANCELADA: ["BORRADOR"],
}

const WHO_CAN_TRANSITION: Record<string, string[]> = {
  PUBLICAR: ["EMPRESA", "ADMIN"],
  CAMBIAR_ESTADO: ["ADMIN"],
}

export class PasantiaService {
  static async crear(data: {
    titulo: string
    descripcion: string
    requisitos?: string
    area: string
    modalidad: string
    duracion?: string
    becaEconomica?: string
    cargaHoraria?: string
    vacantes: number
    empresaId: string
    unidadAcademicaId?: string
    usuarioId: string
  }) {
    const pasantia = await PasantiaRepository.createConDetalle(
      {
        titulo: data.titulo,
        descripcion: data.descripcion,
        requisitos: data.requisitos,
        area: data.area,
        modalidad: data.modalidad,
        duracion: data.duracion,
        becaEconomica: data.becaEconomica,
        cargaHoraria: data.cargaHoraria,
        vacantes: data.vacantes,
        empresaId: data.empresaId,
        unidadAcademicaId: data.unidadAcademicaId || null,
        estado: "BORRADOR",
      }
    )

    await logAudit(data.usuarioId, "CREAR_PASANTIA", `Creó pasantía: ${pasantia.titulo}`, "Pasantia", pasantia.id)

    // Notify academic unit
    if (pasantia.unidadAcademica?.universidad?.email) {
      const emailContent = pasantiaNotificationEmail({
        titulo: pasantia.titulo,
        descripcion: pasantia.descripcion,
        area: pasantia.area,
        modalidad: pasantia.modalidad,
        duracion: pasantia.duracion || undefined,
        becaEconomica: pasantia.becaEconomica || undefined,
        empresa: pasantia.empresa.nombre,
      })
      await sendEmail({
        to: pasantia.unidadAcademica.universidad.email,
        subject: emailContent.subject,
        html: emailContent.html,
      })
    }

    return pasantia
  }

  static async cambiarEstado(
    pasantiaId: string,
    nuevoEstado: string,
    usuarioId: string,
    opts?: { role?: string },
  ) {
    const pasantiaActual = await PasantiaRepository.findByIdSelectEstado(pasantiaId)
    if (!pasantiaActual) throw new Error("Pasantía no encontrada")

    const actual = pasantiaActual.estado
    const permitidos = ESTADO_TRANSITIONS[actual] || []
    if (!permitidos.includes(nuevoEstado)) {
      throw new Error(`No se puede cambiar de ${actual} a ${nuevoEstado}`)
    }

    if (nuevoEstado === "PUBLICADA" && opts?.role && !WHO_CAN_TRANSITION.PUBLICAR.includes(opts.role)) {
      throw new Error("Solo la empresa o admin pueden publicar pasantías")
    }

    if (nuevoEstado === "ACTIVA") {
      const postulacionesAceptadas = await PostulacionRepository.findAceptadasConConvenio(pasantiaId)

      if (postulacionesAceptadas.length === 0) {
        throw new Error("No hay postulaciones aceptadas para esta pasantía")
      }

      for (const p of postulacionesAceptadas) {
        if (!p.convenio || !p.convenio.firmaAlumno || !p.convenio.firmaEmpresa || !p.convenio.firmaUniversidad) {
          throw new Error("Hay postulaciones aceptadas sin convenio tripartito completado")
        }
        if (!p.seguro) {
          throw new Error("Hay postulaciones aceptadas sin seguro de pasantía cargado")
        }
        if (new Date(p.seguro.coberturaHasta) < new Date()) {
          throw new Error("Hay un seguro de pasantía vencido. Renovalo antes de activar")
        }
      }
    }

    const pasantia = await PasantiaRepository.update(pasantiaId, {
      estado: nuevoEstado as EstadoPasantia,
    })

    await logAudit(
      usuarioId,
      "CAMBIAR_ESTADO_PASANTIA",
      `Cambió estado de "${pasantiaActual.titulo}" a ${nuevoEstado}`,
      "Pasantia",
      pasantiaId
    )

    return pasantia
  }

  static async listarPublicadas() {
    return PasantiaRepository.findPublicadas()
  }

  static async obtenerPorId(id: string) {
    return PasantiaRepository.findByIdConDetalle(id)
  }
}
