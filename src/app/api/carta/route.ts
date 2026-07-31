import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generarCartaPDF } from "@/lib/pdf"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const url = new URL(req.url)
  const postulacionId = url.searchParams.get("postulacionId")
  const tipo = url.searchParams.get("tipo") || "presentacion"

  if (!postulacionId) return NextResponse.json({ error: "Falta postulacionId" }, { status: 400 })

  const postulacion = await prisma.postulacion.findUnique({
    where: { id: postulacionId },
    include: {
      alumno: { select: { name: true, dni: true } },
      pasantia: { select: { titulo: true, empresa: { select: { nombre: true } } } },
    },
  })
  if (!postulacion) return NextResponse.json({ error: "Postulación no encontrada" }, { status: 404 })

  const pdf = generarCartaPDF({
    alumno: postulacion.alumno.name,
    alumnoDni: postulacion.alumno.dni || "—",
    empresa: postulacion.pasantia.empresa.nombre,
    universidad: "Universidad",
    pasantiaTitulo: postulacion.pasantia.titulo,
    tipo: tipo as "presentacion" | "aceptacion",
    fecha: new Date().toLocaleDateString("es-AR"),
  })

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${tipo}-${postulacion.pasantia.titulo.replace(/\s+/g, "-")}.pdf"`,
    },
  })
}
