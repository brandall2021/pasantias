import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { logAudit } from "@/lib/audit"

export async function POST(req: Request) {
  try {
    const { name, email, password, role, ...extra } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const userData: any = {
      name,
      email,
      password: hashedPassword,
      role: role || "ESTUDIANTE",
      dni: extra.dni || undefined,
      fechaNacimiento: extra.fechaNacimiento ? new Date(extra.fechaNacimiento) : undefined,
      direccion: extra.direccion || undefined,
      legajo: extra.legajo || undefined,
      anioCursada: extra.anioCursada || undefined,
      promedio: extra.promedio || undefined,
    }

    if (role === "EMPRESA") {
      if (!extra.empresaNombre || !extra.cuit) {
        return NextResponse.json({ error: "Nombre de empresa y CUIT requeridos" }, { status: 400 })
      }
      const empresa = await prisma.empresa.create({
        data: { nombre: extra.empresaNombre, cuit: extra.cuit, direccion: extra.direccion, email },
      })
      userData.empresaId = empresa.id
    }

    if (role === "UNIVERSIDAD") {
      if (!extra.universidadNombre) {
        return NextResponse.json({ error: "Nombre de universidad requerido" }, { status: 400 })
      }
      const universidad = await prisma.universidad.create({
        data: { nombre: extra.universidadNombre, email },
      })
      userData.universidadId = universidad.id
    }

    if (role === "ESTUDIANTE") {
      userData.carreraId = extra.carreraId || undefined
    }

    const user = await prisma.user.create({ data: userData })

    await logAudit(user.id, "REGISTRO", `Usuario ${role} registrado: ${email}`, "User", user.id)

    return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role })
  } catch (error) {
    return NextResponse.json({ error: "Error al registrar" }, { status: 500 })
  }
}
