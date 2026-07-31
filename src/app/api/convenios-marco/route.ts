import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { convenioMarcoSchema } from "@/lib/validations"
import { ConvenioMarcoRepository } from "@/repositories/convenioMarco.repository"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "UNIVERSIDAD" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const parsed = convenioMarcoSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Faltan campos requeridos" },
      { status: 400 }
    )
  }

  const { empresaId, fechaInicio, fechaFin, archivo } = parsed.data

  const universidadId = session.user.role === "UNIVERSIDAD"
    ? (session.user as { universidadId?: string }).universidadId
    : null

  if (!universidadId) {
    return NextResponse.json({ error: "Universidad no encontrada" }, { status: 400 })
  }

  const existente = await ConvenioMarcoRepository.findByUniversidadYEmpresa(universidadId, empresaId)
  if (existente) {
    return NextResponse.json({ error: "Ya existe un convenio marco con esta empresa" }, { status: 400 })
  }

  const convenio = await ConvenioMarcoRepository.create({
    universidadId,
    empresaId,
    fechaInicio: new Date(fechaInicio),
    fechaFin: fechaFin ? new Date(fechaFin) : null,
    archivo,
  })

  await logAudit(
    session.user.id,
    "CREAR_CONVENIO_MARCO",
    `Convenio marco con empresa ${empresaId}`,
    "ConvenioMarco",
    convenio.id
  )

  return NextResponse.json(convenio)
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const url = new URL(req.url)
  const empresaId = url.searchParams.get("empresaId") || undefined

  if (session.user.role === "UNIVERSIDAD") {
    const universidadId = (session.user as { universidadId?: string }).universidadId
    const convenios = await ConvenioMarcoRepository.findByUniversidadId(universidadId!, empresaId)
    return NextResponse.json(convenios)
  }

  if (session.user.role === "EMPRESA") {
    const uid = (session.user as { empresaId?: string }).empresaId
    const convenios = await ConvenioMarcoRepository.findByEmpresaId(uid!, empresaId)
    return NextResponse.json(convenios)
  }

  return NextResponse.json({ error: "No autorizado" }, { status: 401 })
}
