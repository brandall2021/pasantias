import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const DOCS_REQUERIDOS = ["CV", "ALUMNO_REGULAR", "ANALITICO_PARCIAL", "SALUD"]

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ESTUDIANTE") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { pasantiaId, mensaje, documentos: docsData } = await req.json()

    if (!pasantiaId) {
      return NextResponse.json({ error: "Falta la pasantía" }, { status: 400 })
    }

    const pasantia = await prisma.pasantia.findUnique({ where: { id: pasantiaId } })
    if (!pasantia || !pasantia.activo) {
      return NextResponse.json({ error: "Pasantía no disponible" }, { status: 400 })
    }

    const existente = await prisma.postulacion.findUnique({
      where: { pasantiaId_estudianteId: { pasantiaId, estudianteId: session.user.id } },
    })
    if (existente) {
      return NextResponse.json({ error: "Ya te postulaste a esta pasantía" }, { status: 400 })
    }

    const docsAdjuntos = docsData || []
    const tiposAdjuntos = docsAdjuntos.map((d: any) => d.tipo)
    const faltantes = DOCS_REQUERIDOS.filter((t) => !tiposAdjuntos.includes(t))

    if (faltantes.length > 0) {
      return NextResponse.json({
        error: `Faltan documentos obligatorios: ${faltantes.join(", ")}`,
        faltantes,
      }, { status: 400 })
    }

    const postulacion = await prisma.postulacion.create({
      data: {
        pasantiaId,
        estudianteId: session.user.id,
        mensaje: mensaje || null,
        documentos: {
          create: docsAdjuntos.map((d: any) => ({
            nombre: d.nombre,
            tipo: d.tipo,
            url: d.url,
            usuarioId: session.user.id,
          })),
        },
      },
      include: { documentos: true },
    })

    return NextResponse.json(postulacion, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Error al postular" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "INSTITUCION") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { id, estado } = await req.json()
    const postulacion = await prisma.postulacion.update({
      where: { id },
      data: { estado },
    })
    return NextResponse.json(postulacion)
  } catch {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 })
  }
}
