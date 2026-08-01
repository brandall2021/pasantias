import { prisma } from "@/lib/prisma"
import { crearNotificacion } from "@/lib/notificacion"
import { sendEmail, recordatorioEmail } from "@/lib/email"

export class CronService {
  static async ejecutar() {
    const resultados: string[] = []
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    resultados.push(await this.recordarConveniosPendientes(hoy))
    resultados.push(await this.recordarEvaluacionesProximas(hoy))
    resultados.push(await this.recordarPlanesAVencer(hoy))
    resultados.push(await this.alertarHorasExcedidas(hoy))

    return resultados
  }

  private static async recordarConveniosPendientes(hoy: Date) {
    const hace15Dias = new Date(hoy)
    hace15Dias.setDate(hace15Dias.getDate() - 15)

    const pendientes = await prisma.postulacion.findMany({
      where: {
        estado: "ACEPTADO",
        convenio: {
          OR: [
            { firmaAlumno: false },
            { firmaEmpresa: false },
            { firmaUniversidad: false },
          ],
        },
      },
      include: {
        alumno: { select: { id: true, name: true, email: true } },
        pasantia: { select: { titulo: true, empresa: { select: { nombre: true } } } },
        convenio: true,
      },
    })

    for (const p of pendientes) {
      const firmaIncompleta = [
        !p.convenio?.firmaAlumno,
        !p.convenio?.firmaEmpresa,
        !p.convenio?.firmaUniversidad,
      ]
      const todas = firmaIncompleta.every(Boolean)

      if (!p.convenio || p.convenio.createdAt > hace15Dias || todas) continue

      await crearNotificacion({
        usuarioId: p.alumno.id,
        titulo: "Convenio pendiente de firma",
        mensaje: `Recordatorio: falta firmar el convenio de "${p.pasantia.titulo}"`,
        link: "/perfil/postulaciones",
      })

      await sendEmail({
        to: p.alumno.email,
        ...recordatorioEmail({
          nombre: p.alumno.name,
          titulo: "Convenio pendiente de firma",
          mensaje: `Falta firmar el convenio de la pasantía "${p.pasantia.titulo}" en ${p.pasantia.empresa.nombre}. Ingresá a la plataforma para firmarlo.`,
        }),
      })
    }

    return `convenios_pendientes:${pendientes.length}`
  }

  private static async recordarEvaluacionesProximas(hoy: Date) {
    const en7Dias = new Date(hoy)
    en7Dias.setDate(en7Dias.getDate() + 7)

    const evaluaciones = await prisma.evaluacion.findMany({
      where: {
        fecha: { gte: hoy, lte: en7Dias },
      },
      include: {
        convenio: {
          include: {
            postulacion: {
              select: {
                alumno: { select: { id: true, name: true } },
                tutorAcademicoId: true,
                tutorEmpresaId: true,
                pasantia: { select: { titulo: true } },
              },
            },
          },
        },
      },
    })

    for (const ev of evaluaciones) {
      const postulacion = ev.convenio.postulacion
      const receptores = [
        postulacion.alumno.id,
        postulacion.tutorAcademicoId,
        postulacion.tutorEmpresaId,
      ].filter(Boolean)

      for (const uid of receptores) {
        await crearNotificacion({
          usuarioId: uid!,
          titulo: "Evaluación próxima",
          mensaje: `La evaluación (${ev.tipo}) de "${postulacion.pasantia.titulo}" vence el ${ev.fecha.toLocaleDateString("es-AR")}`,
          link: "/perfil/evaluaciones",
        })
      }
    }

    return `evaluaciones_proximas:${evaluaciones.length}`
  }

  private static async recordarPlanesAVencer(hoy: Date) {
    const en15Dias = new Date(hoy)
    en15Dias.setDate(en15Dias.getDate() + 15)

    const planes = await prisma.planTrabajo.findMany({
      where: {
        fechaFin: { gte: hoy, lte: en15Dias },
      },
      include: {
        convenio: {
          include: {
            postulacion: {
              select: {
                alumno: { select: { id: true, name: true, email: true } },
                tutorAcademicoId: true,
                tutorEmpresaId: true,
                pasantia: { select: { titulo: true } },
              },
            },
          },
        },
      },
    })

    for (const plan of planes) {
      const postulacion = plan.convenio.postulacion
      const receptores = [
        postulacion.alumno.id,
        postulacion.tutorAcademicoId,
        postulacion.tutorEmpresaId,
      ].filter(Boolean)

      for (const uid of receptores) {
        await crearNotificacion({
          usuarioId: uid!,
          titulo: "Plan de trabajo a vencer",
          mensaje: `El plan de "${postulacion.pasantia.titulo}" finaliza el ${plan.fechaFin.toLocaleDateString("es-AR")}. Completá las evaluaciones finales.`,
          link: "/calendario",
        })
      }

      await sendEmail({
        to: postulacion.alumno.email,
        ...recordatorioEmail({
          nombre: postulacion.alumno.name,
          titulo: "Plan de trabajo a vencer",
          mensaje: `Tu plan de trabajo de "${postulacion.pasantia.titulo}" finaliza el ${plan.fechaFin.toLocaleDateString("es-AR")}. Asegurate de completar las horas y evaluaciones pendientes.`,
        }),
      })
    }

    return `planes_a_vencer:${planes.length}`
  }

  private static async alertarHorasExcedidas(hoy: Date) {
    const inicioSemana = new Date(hoy)
    const dia = (inicioSemana.getDay() + 6) % 7
    inicioSemana.setDate(inicioSemana.getDate() - dia)

    const planes = await prisma.planTrabajo.findMany({
      where: { fechaInicio: { lte: hoy }, fechaFin: { gte: hoy } },
      include: {
        convenio: {
          include: {
            registroHoras: { where: { fecha: { gte: inicioSemana } } },
            postulacion: {
              select: {
                alumnoId: true,
                tutorAcademicoId: true,
                tutorEmpresaId: true,
                pasantia: { select: { titulo: true } },
              },
            },
          },
        },
      },
    })

    let alertas = 0
    for (const plan of planes) {
      const horasSemana = plan.convenio.registroHoras.reduce((s, r) => s + r.horas, 0)
      if (horasSemana <= plan.horasSemana) continue
      alertas++

      const postulacion = plan.convenio.postulacion
      const receptores = [
        postulacion.alumnoId,
        postulacion.tutorAcademicoId,
        postulacion.tutorEmpresaId,
      ].filter(Boolean)

      for (const uid of receptores) {
        await crearNotificacion({
          usuarioId: uid!,
          titulo: "Horas semanales excedidas",
          mensaje: `"${postulacion.pasantia.titulo}" registró ${horasSemana}h esta semana (máx. ${plan.horasSemana}h).`,
          link: "/tutor-academico",
        })
      }
    }

    return `horas_excedidas:${alertas}`
  }
}
