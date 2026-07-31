import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { logAudit } from "@/lib/audit"
import { registerSchema, parseDate } from "@/lib/validations"
import { UserRepository } from "@/repositories/user.repository"
import { EmpresaRepository } from "@/repositories/empresa.repository"
import { UniversidadRepository } from "@/repositories/universidad.repository"
import type { Prisma } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Datos inválidos" },
        { status: 400 }
      )
    }

    const { name, email, password, role, ...extra } = parsed.data

    const exists = await UserRepository.findByEmail(email)
    if (exists) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const userData: Prisma.UserUncheckedCreateInput = {
      name,
      email,
      password: hashedPassword,
      role,
      dni: extra.dni || undefined,
      fechaNacimiento: extra.fechaNacimiento ? parseDate(extra.fechaNacimiento) || undefined : undefined,
      direccion: extra.direccion || undefined,
      legajo: extra.legajo || undefined,
      anioCursada: extra.anioCursada || undefined,
      promedio: extra.promedio || undefined,
    }

    if (role === "EMPRESA") {
      if (!extra.empresaNombre || !extra.cuit) {
        return NextResponse.json({ error: "Nombre de empresa y CUIT requeridos" }, { status: 400 })
      }
      const empresa = await EmpresaRepository.create({
        nombre: extra.empresaNombre,
        cuit: extra.cuit,
        direccion: extra.direccion,
        email,
      })
      userData.empresaId = empresa.id
    }

    if (role === "UNIVERSIDAD") {
      if (!extra.universidadNombre) {
        return NextResponse.json({ error: "Nombre de universidad requerido" }, { status: 400 })
      }
      const universidad = await UniversidadRepository.create({
        nombre: extra.universidadNombre,
        email,
      })
      userData.universidadId = universidad.id
    }

    if (role === "ESTUDIANTE") {
      userData.carreraId = extra.carreraId || undefined
    }

    const user = await UserRepository.create(userData)

    await logAudit(user.id, "REGISTRO", `Usuario ${role} registrado: ${email}`, "User", user.id)

    return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role })
  } catch (error) {
    return NextResponse.json({ error: "Error al registrar" }, { status: 500 })
  }
}
