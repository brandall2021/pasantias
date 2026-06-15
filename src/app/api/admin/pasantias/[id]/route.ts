import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()
  const pasantia = await prisma.pasantia.update({ where: { id }, data })
  return NextResponse.json(pasantia)
}
