import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { crearNotificacion } from "@/lib/notificacion"
import { convenioMarcoSchema } from "@/lib/validations"
import { ConvenioMarcoRepository } from "@/repositories/convenioMarco.repository"
import { UserRepository } from "@/repositories/user.repository"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const parsed = convenioMarcoSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Faltan campos requeridos" },
      { status: 400 }
    )
  }

  const { empresaId, fechaInicio, fechaFin, archivo } = parsed.data

  let universidadId: string | null = null
  let estado = "ACTIVO"

  if (session.user.role === "UNIVERSIDAD" || session.user.role === "ADMIN") {
    universidadId = session.user.role === "UNIVERSIDAD"
      ? (session.user as { universidadId?: string }).universidadId || null
      : (parsed.data as { universidadId?: string }).universidadId || null
  } else if (session.user.role === "EMPRESA") {
    universidadId = (parsed.data as { universidadId?: string }).universidadId || null
    estado = "SOLICITADO"
  }

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
    estado,
  })

  await logAudit(
    session.user.id,
    "CREAR_CONVENIO_MARCO",
    `Convenio marco ${estado === "SOLICITADO" ? "solicitado por empresa" : "creado"} ${empresaId}`,
    "ConvenioMarco",
    convenio.id
  )

  if (estado === "SOLICITADO") {
    const univUsers = await UserRepository.findIdPorUniversidad(universidadId)
    for (const u of univUsers) {
      await crearNotificacion({
        usuarioId: u.id,
        titulo: "Solicitud de convenio marco",
        mensaje: `Una empresa solicitó un convenio marco. Revisá la solicitud.`,
        link: "/universidad",
      })
    }
  }

  return NextResponse.json(convenio)
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id, estado } = await req.json()
  if (!id || !["ACTIVO", "RECHAZADO"].includes(estado)) {
    return NextResponse.json({ error: "estado inválido" }, { status: 400 })
  }

  if (session.user.role !== "UNIVERSIDAD" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Solo la universidad puede aprobar/rechazar" }, { status: 401 })
  }

  const convenio = await ConvenioMarcoRepository.update(id, { estado })
  await logAudit(session.user.id, "CAMBIAR_ESTADO_CONVENIO_MARCO", `Convenio marco ${estado}`, "ConvenioMarco", id)
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
