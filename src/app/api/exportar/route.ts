import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "UNIVERSIDAD")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const url = new URL(req.url)
  const tipo = url.searchParams.get("tipo") || "pasantias"

  let csv = ""
  let filename = ""

  if (tipo === "pasantias") {
    const facultadIds = session.user.role === "UNIVERSIDAD"
      ? (await prisma.universidad.findUnique({
          where: { id: (session.user as { universidadId: string }).universidadId },
          select: { facultades: { select: { id: true } } },
        }))?.facultades.map((f) => f.id) ?? []
      : undefined
    const where: Prisma.PasantiaWhereInput = facultadIds ? { unidadAcademicaId: { in: facultadIds } } : {}

    const pasantias = await prisma.pasantia.findMany({
      where,
      include: {
        empresa: { select: { nombre: true } },
        unidadAcademica: { select: { nombre: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    csv = "Título,Empresa,Área,Modalidad,Estado,Facultad,Publicada\n"
    for (const p of pasantias) {
      csv += `"${p.titulo}","${p.empresa.nombre}","${p.area || ""}","${p.modalidad || ""}","${p.estado}","${p.unidadAcademica?.nombre || ""}","${p.createdAt.toISOString().split("T")[0]}"\n`
    }
    filename = "pasantias.csv"
  } else if (tipo === "postulaciones") {
    const facultadIds = session.user.role === "UNIVERSIDAD"
      ? (await prisma.universidad.findUnique({
          where: { id: (session.user as { universidadId: string }).universidadId },
          select: { facultades: { select: { id: true } } },
        }))?.facultades.map((f) => f.id) ?? []
      : undefined
    const where: Prisma.PostulacionWhereInput = facultadIds ? { pasantia: { unidadAcademicaId: { in: facultadIds } } } : {}

    const postulaciones = await prisma.postulacion.findMany({
      where,
      include: {
        alumno: { select: { name: true, email: true } },
        pasantia: { select: { titulo: true, empresa: { select: { nombre: true } } } },
      },
      orderBy: { fecha: "desc" },
    })

    csv = "Estudiante,Email,Pasantía,Empresa,Estado,Fecha\n"
    for (const p of postulaciones) {
      csv += `"${p.alumno.name}","${p.alumno.email}","${p.pasantia.titulo}","${p.pasantia.empresa.nombre}","${p.estado}","${p.fecha.toISOString().split("T")[0]}"\n`
    }
    filename = "postulaciones.csv"
  } else {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
