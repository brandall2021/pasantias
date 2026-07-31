import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { getAuthSecret } from "@/lib/config"
import { restablecerSchema } from "@/lib/validations"
import { UserRepository } from "@/repositories/user.repository"

export async function POST(req: Request) {
  try {
    const parsed = restablecerSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Datos inválidos" },
        { status: 400 }
      )
    }

    const { token, password } = parsed.data

    let decoded: { email: string }
    try {
      decoded = jwt.verify(token, getAuthSecret()) as { email: string }
    } catch {
      return NextResponse.json({ error: "El enlace ha expirado o es inválido" }, { status: 400 })
    }

    const user = await UserRepository.findByEmail(decoded.email)
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const hashed = await bcrypt.hash(password, 12)
    await UserRepository.update(user.id, { password: hashed })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al restablecer la contraseña" }, { status: 500 })
  }
}
