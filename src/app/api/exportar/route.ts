import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { UniversidadRepository } from "@/repositories/universidad.repository"
import { PasantiaRepository } from "@/repositories/pasantia.repository"
import { PostulacionRepository } from "@/repositories/postulacion.repository"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "UNIVERSIDAD")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const url = new URL(req.url)
  const tipo = url.searchParams.get("tipo") || "pasantias"

  let csv = ""
  let filename = ""

  const obtenerFacultadIds = async () => {
    if (session.user.role !== "UNIVERSIDAD") return undefined
    const universidadId = (session.user as { universidadId?: string }).universidadId
    if (!universidadId) return undefined
    const result = await UniversidadRepository.findFacultadesIds(universidadId)
    return result?.facultades.map((f) => f.id) ?? []
  }

  if (tipo === "pasantias") {
    const facultadIds = await obtenerFacultadIds()
    const pasantias = await PasantiaRepository.findExportables(facultadIds)

    csv = "Título,Empresa,Área,Modalidad,Estado,Facultad,Publicada\n"
    for (const p of pasantias) {
      csv += `"${p.titulo}","${p.empresa.nombre}","${p.area || ""}","${p.modalidad || ""}","${p.estado}","${p.unidadAcademica?.nombre || ""}","${p.createdAt.toISOString().split("T")[0]}"\n`
    }
    filename = "pasantias.csv"
  } else if (tipo === "postulaciones") {
    const facultadIds = await obtenerFacultadIds()
    const postulaciones = await PostulacionRepository.findExportables(facultadIds)

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
