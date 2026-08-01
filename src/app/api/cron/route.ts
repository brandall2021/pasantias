import { NextResponse } from "next/server"
import { CronService } from "@/services/cron.service"
import { config } from "@/lib/config"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get("token")

  if (!config.cron.secret || token !== config.cron.secret) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const resultados = await CronService.ejecutar()
  return NextResponse.json({ ok: true, resultados })
}
