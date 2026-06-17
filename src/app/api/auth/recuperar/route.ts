import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail, resetPasswordEmail } from "@/lib/email"
import jwt from "jsonwebtoken"

const RESET_SECRET = process.env.AUTH_SECRET || "fallback-secret"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: "Si el email existe, recibirás un enlace de recuperación" }, { status: 200 })
    }

    if (!user.password) {
      return NextResponse.json({ error: "Esta cuenta usa Google OAuth, no tiene contraseña" }, { status: 400 })
    }

    const token = jwt.sign({ email: user.email }, RESET_SECRET, { expiresIn: "1h" })

    const baseUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || "http://localhost:3000"
    const resetUrl = `${baseUrl}/restablecer/${token}`

    await sendEmail({
      to: user.email,
      ...resetPasswordEmail({ name: user.name, url: resetUrl }),
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
