import { NextResponse } from "next/server"
import { FacultadRepository } from "@/repositories/facultad.repository"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const universidadId = url.searchParams.get("universidadId") || undefined

  const facultades = await FacultadRepository.findAll(universidadId)
  return NextResponse.json(facultades)
}
