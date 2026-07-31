import { NextResponse } from "next/server"
import { CarreraRepository } from "@/repositories/carrera.repository"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const facultadId = url.searchParams.get("facultadId") || undefined

  const carreras = await CarreraRepository.findAll(facultadId)
  return NextResponse.json(carreras)
}
