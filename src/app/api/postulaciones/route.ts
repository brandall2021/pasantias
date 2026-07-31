import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { sendEmail, postulacionEstadoEmail } from "@/lib/email"
import { crearNotificacion } from "@/lib/notificacion"
import { PasantiaRepository } from "@/repositories/pasantia.repository"
import { PostulacionRepository } from "@/repositories/postulacion.repository"
import { DocumentoRepository } from "@/repositories/documento.repository"
import { ConversacionRepository } from "@/repositories/conversacion.repository"
import { UserRepository } from "@/repositories/user.repository"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ESTUDIANTE") {
    return NextResponse.json({ error: "Solo estudiantes pueden postularse" }, { status: 403 })
  }

  try {
    const { pasantiaId, mensaje, documentos } = await req.json()

    const pasantia = await PasantiaRepository.findByIdSimple(pasantiaId)
    if (!pasantia) return NextResponse.json({ error: "Pasantía no encontrada" }, { status: 404 })
    if (pasantia.estado !== "PUBLICADA") {
      return NextResponse.json({ error: "Esta pasantía no acepta postulaciones" }, { status: 400 })
    }

    const existing = await PostulacionRepository.findByPasantiaYAlumno(pasantiaId, session.user.id)
    if (existing) {
      return NextResponse.json({ error: "Ya te postulaste a esta pasantía" }, { status: 400 })
    }

    const postulacion = await PostulacionRepository.create({
      pasantiaId,
      alumnoId: session.user.id,
      mensaje,
    })

    // Guardar documentos adjuntos
    if (documentos?.length > 0) {
      await DocumentoRepository.createMany(
        documentos.map((d: { tipo: string; url: string }) => ({
          tipo: d.tipo,
          url: d.url,
          usuarioId: session.user.id,
          postulacionId: postulacion.id,
        }))
      )
    }

    // Create conversacion automáticamente
    await ConversacionRepository.create(postulacion.id)

    // Notificar a la empresa
    const empresaUsuarios = await UserRepository.findIdPorEmpresa(pasantia.empresaId)
    for (const u of empresaUsuarios) {
      await crearNotificacion({
        usuarioId: u.id,
        titulo: "Nueva postulación",
        mensaje: `${session.user.name} se postuló a "${pasantia.titulo}"`,
        link: `/perfil/pasantias/${pasantia.id}`,
      })
    }

    await logAudit(session.user.id, "POSTULAR", `Se postuló a: ${pasantia.titulo}`, "Postulacion", postulacion.id)
    return NextResponse.json(postulacion)
  } catch (error) {
    return NextResponse.json({ error: "Error al postularse" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id, estado, tutorAcademicoId, tutorEmpresaId } = await req.json()

  const postulacion = await PostulacionRepository.findByIdConPasantia(id)
  if (!postulacion) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  const userEmpresaId = (session.user as { empresaId?: string }).empresaId
  const esEmpresa = postulacion.pasantia.empresaId === userEmpresaId
  const esAdmin = session.user.role === "ADMIN"
  const esUniversidad = session.user.role === "UNIVERSIDAD"

  const updateData: Record<string, string | boolean | null> = {}
  if (estado !== undefined) {
    if (!esEmpresa && !esAdmin) return NextResponse.json({ error: "No autorizado a cambiar estado" }, { status: 401 })
    updateData.estado = estado
  }
  if (tutorAcademicoId !== undefined) {
    if (!esAdmin && !esUniversidad) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    updateData.tutorAcademicoId = tutorAcademicoId || null
  }
  if (tutorEmpresaId !== undefined) {
    if (!esAdmin && !esEmpresa) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    updateData.tutorEmpresaId = tutorEmpresaId || null
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Sin cambios" }, { status: 400 })
  }

  const updated = (await PostulacionRepository.update(
    id,
    updateData,
    {
      alumno: { select: { name: true, email: true } },
      pasantia: { select: { titulo: true, empresa: { select: { nombre: true } } } },
    }
  )) as unknown as {
    alumno: { name: string; email: string }
    pasantia: { titulo: string; empresa: { nombre: string } }
    alumnoId: string
  }

  // Notificar al estudiante si cambió estado
  if (estado && (estado === "ACEPTADO" || estado === "RECHAZADO" || estado === "REVISADO")) {
    const emailContent = postulacionEstadoEmail({
      nombre: updated.alumno.name,
      pasantiaTitulo: updated.pasantia.titulo,
      empresaNombre: updated.pasantia.empresa.nombre,
      nuevoEstado: estado,
    })
    await sendEmail({ to: updated.alumno.email, ...emailContent })

    const notifLabels: Record<string, string> = {
      REVISADO: "revisada",
      ACEPTADO: "aceptada",
      RECHAZADO: "rechazada",
    }
    await crearNotificacion({
      usuarioId: updated.alumnoId,
      titulo: `Postulación ${notifLabels[estado] || estado}`,
      mensaje: `Tu postulación a "${updated.pasantia.titulo}" en ${updated.pasantia.empresa.nombre} fue ${notifLabels[estado] || estado}`,
      link: "/perfil/postulaciones",
    })
  }

  await logAudit(session.user.id, "CAMBIAR_ESTADO_POSTULACION", `Actualizó postulación`, "Postulacion", id)

  return NextResponse.json(updated)
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const url = new URL(req.url)
  const pasantiaId = url.searchParams.get("pasantiaId") || undefined

  if (session.user.role === "ESTUDIANTE") {
    const postulaciones = await PostulacionRepository.findByAlumnoId(session.user.id, pasantiaId)
    return NextResponse.json(postulaciones)
  }

  if (session.user.role === "EMPRESA") {
    const empresaId = (session.user as { empresaId?: string }).empresaId
    const postulaciones = await PostulacionRepository.findByEmpresaId(empresaId!, pasantiaId)
    return NextResponse.json(postulaciones)
  }

  if (session.user.role === "ADMIN") {
    const postulaciones = await PostulacionRepository.findByPasantiaId(pasantiaId)
    return NextResponse.json(postulaciones)
  }

  return NextResponse.json({ error: "No autorizado" }, { status: 401 })
}
