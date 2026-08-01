import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { AnalyticsService } from "@/services/analytics.service"

export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user.role !== "UNIVERSIDAD" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const universidadId = (session.user as { universidadId?: string }).universidadId
  if (!universidadId) return NextResponse.json({ error: "Sin universidad" }, { status: 400 })

  try {
    const data = await AnalyticsService.resumenUniversidad(universidadId)
    return NextResponse.json(data)
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "Error al generar analytics"
    return NextResponse.json({ error: mensaje }, { status: 400 })
  }
}
