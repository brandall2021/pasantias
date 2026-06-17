import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { name, email, password, role, institucionNombre, dni, fechaNacimiento, direccion, asisteA, legajo } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    let institucionId: string | undefined

    if (role === "INSTITUCION") {
      if (!institucionNombre) {
        return NextResponse.json({ error: "Nombre de institución requerido" }, { status: 400 })
      }

      const institucion = await prisma.institucion.create({
        data: {
          nombre: institucionNombre,
          email,
        },
      })
      institucionId = institucion.id
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "ESTUDIANTE",
        institucionId,
        dni: dni || undefined,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined,
        direccion: direccion || undefined,
        asisteA: asisteA || undefined,
        legajo: legajo || undefined,
      },
    })

    return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role })
  } catch (error) {
    return NextResponse.json({ error: "Error al registrar" }, { status: 500 })
  }
}
