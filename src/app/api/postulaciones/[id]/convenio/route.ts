import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { logAudit } from "@/lib/audit"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const { parte, url } = await req.json()

  if (!parte || !url) {
    return NextResponse.json({ error: "Faltan campos: parte, url" }, { status: 400 })
  }

  if (!["estudiante", "empresa", "institucion"].includes(parte)) {
    return NextResponse.json({ error: "parte inválido: estudiante, empresa o institucion" }, { status: 400 })
  }

  const postulacion = await prisma.postulacion.findUnique({
    where: { id },
    include: {
      pasantia: { select: { institucionId: true, titulo: true } },
      estudiante: { select: { id: true } },
    },
  })

  if (!postulacion) return NextResponse.json({ error: "Postulación no encontrada" }, { status: 404 })

  // Authorization: only the corresponding party can upload
  if (parte === "estudiante" && postulacion.estudiante.id !== session.user.id) {
    return NextResponse.json({ error: "Solo el estudiante puede cargar su convenio" }, { status: 401 })
  }
  if (parte === "empresa" && postulacion.pasantia.institucionId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo la empresa puede cargar su convenio" }, { status: 401 })
  }
  if (parte === "institucion" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo un administrador puede cargar el convenio de la institución" }, { status: 401 })
  }

  const fieldMap: Record<string, string> = {
    estudiante: "convenioEstudianteUrl",
    empresa: "convenioEmpresaUrl",
    institucion: "convenioInstitucionUrl",
  }

  const field = fieldMap[parte]

  const updated = await prisma.postulacion.update({
    where: { id },
    data: {
      [field]: url,
      convenioCompletado: true, // will be recomputed below
    },
    select: {
      convenioEstudianteUrl: true,
      convenioEmpresaUrl: true,
      convenioInstitucionUrl: true,
      convenioCompletado: true,
    },
  })

  // Recompute convenioCompletado
  const completado = !!(
    updated.convenioEstudianteUrl &&
    updated.convenioEmpresaUrl &&
    updated.convenioInstitucionUrl
  )

  await prisma.postulacion.update({
    where: { id },
    data: { convenioCompletado: completado },
  })

  await logAudit(session.user.id, "SUBIR_CONVENIO",
    `${parte === "estudiante" ? "Estudiante" : parte === "empresa" ? "Empresa" : "Admin"} subió convenio para: ${postulacion.pasantia.titulo}`)

  return NextResponse.json({ completado, field, url })
}
