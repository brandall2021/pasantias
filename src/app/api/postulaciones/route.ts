import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAudit } from "@/lib/audit"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ESTUDIANTE") {
    return NextResponse.json({ error: "Solo estudiantes pueden postularse" }, { status: 403 })
  }

  try {
    const { pasantiaId, mensaje } = await req.json()

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

    // Create conversacion automáticamente
    await prisma.conversacion.create({
      data: { postulacionId: postulacion.id },
    })

    await logAudit(session.user.id, "POSTULAR", `Se postuló a: ${pasantia.titulo}`, "Postulacion", postulacion.id)
    return NextResponse.json(postulacion)
  } catch (error) {
    return NextResponse.json({ error: "Error al postularse" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id, estado } = await req.json()

  const postulacion = await prisma.postulacion.findUnique({
    where: { id },
    include: {
      pasantia: { include: { empresa: { select: { id: true } } } },
      alumno: { select: { id: true } },
    },
  })
  if (!postulacion) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  const userEmpresaId = (session.user as any).empresaId
  const esEmpresa = postulacion.pasantia.empresaId === userEmpresaId
  const esAdmin = session.user.role === "ADMIN"

  if (!esEmpresa && !esAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const updated = await prisma.postulacion.update({
    where: { id },
    data: { estado },
  })

  await logAudit(session.user.id, "CAMBIAR_ESTADO_POSTULACION",
    `Cambió estado de postulación a ${estado}`, "Postulacion", id)

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
    const empresaId = (session.user as any).empresaId
    const where: any = pasantiaId ? { pasantiaId } : {}
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
