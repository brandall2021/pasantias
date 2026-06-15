import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "INSTITUCION") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { id, estado } = await req.json()
    const postulacion = await prisma.postulacion.update({
      where: { id },
      data: { estado },
    })
    return NextResponse.json(postulacion)
  } catch {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 })
  }
}
