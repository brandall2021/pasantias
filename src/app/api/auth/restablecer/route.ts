import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const RESET_SECRET = process.env.AUTH_SECRET || "fallback-secret"

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    let decoded: { email: string }
    try {
      decoded = jwt.verify(token, RESET_SECRET) as { email: string }
    } catch {
      return NextResponse.json({ error: "El enlace ha expirado o es inválido" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: decoded.email } })
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const hashed = await bcrypt.hash(password, 12)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al restablecer la contraseña" }, { status: 500 })
  }
}
