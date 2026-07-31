import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { cambiarPasswordSchema } from "@/lib/validations"
import { UserRepository } from "@/repositories/user.repository"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const parsed = cambiarPasswordSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Datos inválidos" },
      { status: 400 }
    )
  }

  const { currentPassword, newPassword } = parsed.data

  const user = await UserRepository.findById(session.user.id)
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  if (!user.password) {
    return NextResponse.json({ error: "Esta cuenta usa Google OAuth, no tiene contraseña" }, { status: 400 })
  }

  const match = await bcrypt.compare(currentPassword, user.password)
  if (!match) {
    return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 })
  }

  const hashed = await bcrypt.hash(newPassword, 12)
  await UserRepository.update(user.id, { password: hashed })

  return NextResponse.json({ success: true })
}
