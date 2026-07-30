import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"
import type { TipoDocumento } from "@prisma/client"

const UPLOAD_DIR = join(process.cwd(), "uploads")

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const tipo = formData.get("tipo") as string
    const nombre = formData.get("nombre") as string

    if (!file || !tipo) {
      return NextResponse.json({ error: "Faltan campos: file, tipo" }, { status: 400 })
    }

    const ext = file.name.split(".").pop() || "bin"
    const filename = `${randomUUID()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    await mkdir(UPLOAD_DIR, { recursive: true })
    await writeFile(join(UPLOAD_DIR, filename), buffer)

    const documento = await prisma.documento.create({
      data: {
        tipo: tipo as TipoDocumento,
        url: `/api/uploads/${filename}`,
        usuarioId: session.user.id,
      },
    })

    return NextResponse.json(documento)
  } catch (error) {
    return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 })
  }
}
