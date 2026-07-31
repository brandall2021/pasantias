import { NextResponse } from "next/server"
import { UniversidadRepository } from "@/repositories/universidad.repository"

export async function GET() {
  const universidades = await UniversidadRepository.findAllNombre()
  return NextResponse.json(universidades)
}

export async function POST(req: Request) {
  const { nombre } = await req.json()
  if (!nombre) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 })

  const universidad = await UniversidadRepository.create({ nombre })
  return NextResponse.json(universidad)
}
