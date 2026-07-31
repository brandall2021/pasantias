import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { generarConvenioPDF } from "@/lib/pdf"
import { PostulacionRepository } from "@/repositories/postulacion.repository"
import { PasantiaRepository } from "@/repositories/pasantia.repository"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const url = new URL(req.url)
  const postulacionId = url.searchParams.get("postulacionId")
  if (!postulacionId) return NextResponse.json({ error: "Falta postulacionId" }, { status: 400 })

  const postulacion = await PostulacionRepository.findByIdParaConvenio(postulacionId)

  if (!postulacion) return NextResponse.json({ error: "Postulación no encontrada" }, { status: 404 })

  const fac = await PasantiaRepository.findByIdConUniversidad(postulacion.pasantiaId)
  const nombreUniversidad = fac?.unidadAcademica?.universidad?.nombre || "Universidad"

  const pdf = generarConvenioPDF({
    alumno: postulacion.alumno.name,
    alumnoDni: postulacion.alumno.dni || "—",
    empresa: postulacion.pasantia.empresa.nombre,
    empresaCuit: postulacion.pasantia.empresa.cuit,
    universidad: nombreUniversidad,
    pasantiaTitulo: postulacion.pasantia.titulo,
    pasantiaDescripcion: postulacion.pasantia.descripcion,
    pasantiaArea: postulacion.pasantia.area,
    pasantiaModalidad: postulacion.pasantia.modalidad,
    pasantiaDuracion: postulacion.pasantia.duracion || "a convenir",
    tutorAcademico: postulacion.tutorAcademico?.name,
    tutorEmpresa: postulacion.tutorEmpresa?.name,
    fechaInicio: postulacion.convenio?.createdAt.toISOString().split("T")[0],
  })

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="convenio-${postulacion.pasantia.titulo.replace(/\s+/g, "-")}.pdf"`,
    },
  })
}
