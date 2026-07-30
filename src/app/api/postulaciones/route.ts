import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"
import { sendEmail, postulacionEstadoEmail } from "@/lib/email"
import { crearNotificacion } from "@/lib/notificacion"
import type { Prisma } from "@prisma/client"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ESTUDIANTE") {
    return NextResponse.json({ error: "Solo estudiantes pueden postularse" }, { status: 403 })
  }

  try {
    const { pasantiaId, mensaje, documentos } = await req.json()

    const pasantia = await prisma.pasantia.findUnique({ where: { id: pasantiaId } })
    if (!pasantia) return NextResponse.json({ error: "Pasantía no encontrada" }, { status: 404 })
    if (pasantia.estado !== "PUBLICADA") {
      return NextResponse.json({ error: "Esta pasantía no acepta postulaciones" }, { status: 400 })
    }

    const existing = await prisma.postulacion.findUnique({
      where: { pasantiaId_alumnoId: { pasantiaId, alumnoId: session.user.id } },
    })
    if (existing) {
      return NextResponse.json({ error: "Ya te postulaste a esta pasantía" }, { status: 400 })
    }

    const postulacion = await prisma.postulacion.create({
      data: {
        pasantiaId,
        alumnoId: session.user.id,
        mensaje,
      },
    })

    // Guardar documentos adjuntos
    if (documentos?.length > 0) {
      await prisma.documento.createMany({
        data: documentos.map((d: { tipo: string; url: string }) => ({
          tipo: d.tipo,
          url: d.url,
          usuarioId: session.user.id,
          postulacionId: postulacion.id,
        })),
      })
    }

    // Create conversacion automáticamente
    await prisma.conversacion.create({
      data: { postulacionId: postulacion.id },
    })

    // Notificar a la empresa
    const empresaUsuarios = await prisma.user.findMany({
      where: { empresaId: pasantia.empresaId, deletedAt: null },
      select: { id: true },
    })
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

  const postulacion = await prisma.postulacion.findUnique({
    where: { id },
    include: {
      pasantia: { include: { empresa: { select: { id: true } } } },
      alumno: { select: { id: true } },
    },
  })
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

  const updated = await prisma.postulacion.update({
    where: { id },
    data: updateData,
    include: {
      alumno: { select: { name: true, email: true } },
      pasantia: { select: { titulo: true, empresa: { select: { nombre: true } } } },
    },
  })

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

  await logAudit(session.user.id, "CAMBIAR_ESTADO_POSTULACION",
    `Actualizó postulación`, "Postulacion", id)

  return NextResponse.json(updated)
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const url = new URL(req.url)
  const pasantiaId = url.searchParams.get("pasantiaId")

  if (session.user.role === "ESTUDIANTE") {
    const postulaciones = await prisma.postulacion.findMany({
      where: { alumnoId: session.user.id, ...(pasantiaId ? { pasantiaId } : {}) },
      include: {
        pasantia: { select: { id: true, titulo: true, area: true, modalidad: true, estado: true } },
        convenio: true,
      },
      orderBy: { fecha: "desc" },
    })
    return NextResponse.json(postulaciones)
  }

  if (session.user.role === "EMPRESA" || session.user.role === "ADMIN") {
    const empresaId = (session.user as { empresaId?: string }).empresaId
    const where: Prisma.PostulacionWhereInput = pasantiaId ? { pasantiaId } : {}
    if (session.user.role === "EMPRESA") {
      where.pasantia = { empresaId }
    }

    const postulaciones = await prisma.postulacion.findMany({
      where,
      include: {
        alumno: { select: { name: true, email: true } },
        pasantia: { select: { titulo: true } },
        convenio: true,
      },
      orderBy: { fecha: "desc" },
    })
    return NextResponse.json(postulaciones)
  }

  return NextResponse.json({ error: "No autorizado" }, { status: 401 })
}
