import { NextResponse } from "next/server"
import { sendEmail, resetPasswordEmail } from "@/lib/email"
import jwt from "jsonwebtoken"
import { getAuthSecret, getBaseUrl } from "@/lib/config"
import { recuperarSchema } from "@/lib/validations"
import { UserRepository } from "@/repositories/user.repository"

export async function POST(req: Request) {
  try {
    const parsed = recuperarSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 })
    }

    const { email } = parsed.data

    const user = await UserRepository.findByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Si el email existe, recibirás un enlace de recuperación" }, { status: 200 })
    }

    if (!user.password) {
      return NextResponse.json({ error: "Esta cuenta usa Google OAuth, no tiene contraseña" }, { status: 400 })
    }

    const token = jwt.sign({ email: user.email }, getAuthSecret(), { expiresIn: "1h" })

    const resetUrl = `${getBaseUrl()}/restablecer/${token}`

    await sendEmail({
      to: user.email,
      ...resetPasswordEmail({ name: user.name, url: resetUrl }),
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
