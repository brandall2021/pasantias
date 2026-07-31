import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { crearNotificacion } from "@/lib/notificacion"
import { seguroSchema } from "@/lib/validations"
import { SeguroRepository } from "@/repositories/seguro.repository"
import { PostulacionRepository } from "@/repositories/postulacion.repository"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const parsed = seguroSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Faltan campos requeridos" },
      { status: 400 }
    )
  }

  const { postulacionId, compania, poliza, coberturaDesde, coberturaHasta, archivo } = parsed.data

  const seguro = await SeguroRepository.upsert(postulacionId, {
    compania,
    poliza,
    coberturaDesde: new Date(coberturaDesde),
    coberturaHasta: new Date(coberturaHasta),
    archivo,
  })

  const postulacion = await PostulacionRepository.findByIdParaSeguro(postulacionId)

  if (postulacion) {
    await crearNotificacion({
      usuarioId: postulacion.alumno.id,
      titulo: "Seguro cargado",
      mensaje: `Seguro cargado para "${postulacion.pasantia.titulo}"`,
      link: "/perfil/postulaciones",
    })
  }

  await logAudit(session.user.id, "CARGAR_SEGURO", `Seguro cargado para postulación ${postulacionId}`, "Seguro", seguro.id)

  return NextResponse.json(seguro)
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const url = new URL(req.url)
  const postulacionId = url.searchParams.get("postulacionId")
  if (!postulacionId) return NextResponse.json({ error: "Falta postulacionId" }, { status: 400 })

  const seguro = await SeguroRepository.findByPostulacionId(postulacionId)
  return NextResponse.json(seguro || {})
}
