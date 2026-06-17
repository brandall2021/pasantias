import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

async function main() {
  console.log("🌱 Iniciando seed...")

  const password = await bcrypt.hash("123456", 12)

  // ─── Admin ──────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: "admin@pasantias.com" },
    update: {},
    create: { name: "Admin", email: "admin@pasantias.com", password, role: "ADMIN", verified: true },
  })
  console.log("✅ Admin creado")

  // ─── Universidad / Facultad / Carrera ───────────────
  const univ = await prisma.universidad.upsert({
    where: { nombre: "Universidad Nacional de Tucumán" },
    update: {},
    create: { nombre: "Universidad Nacional de Tucumán", email: "contacto@unt.edu.ar" },
  })

  const face = await prisma.facultad.create({
    data: { nombre: "Facultad de Ciencias Exactas (FACE)", universidadId: univ.id },
  })

  const carrera1 = await prisma.carrera.create({ data: { nombre: "Lic. en Sistemas de Información", facultadId: face.id } })
  const carrera2 = await prisma.carrera.create({ data: { nombre: "Lic. en Matemática", facultadId: face.id } })

  // ─── Empresas ───────────────────────────────────────
  const empresa1 = await prisma.empresa.create({
    data: {
      nombre: "TechCorp Argentina",
      cuit: "30-12345678-9",
      direccion: "Av. Corrientes 1234, CABA",
      email: "contacto@techcorp.com.ar",
      estado: "VALIDADA",
    },
  })

  const empresa2 = await prisma.empresa.create({
    data: {
      nombre: "Estudio Jurídico Pérez & Asoc.",
      cuit: "30-87654321-0",
      direccion: "San Martín 890, Rosario",
      email: "contacto@estudioperez.com",
      estado: "VALIDADA",
    },
  })

  console.log("✅ Empresas creadas")

  // ─── Usuarios ───────────────────────────────────────
  const userEmpresa1 = await prisma.user.upsert({
    where: { email: "techcorp@pasantias.com" },
    update: {},
    create: { name: "TechCorp Argentina", email: "techcorp@pasantias.com", password, role: "EMPRESA", empresaId: empresa1.id, verified: true },
  })

  const userEmpresa2 = await prisma.user.upsert({
    where: { email: "estudio@pasantias.com" },
    update: {},
    create: { name: "Estudio Jurídico Pérez & Asoc.", email: "estudio@pasantias.com", password, role: "EMPRESA", empresaId: empresa2.id },
  })

  const estudiante1 = await prisma.user.upsert({
    where: { email: "estudiante1@pasantias.com" },
    update: {},
    create: {
      name: "Juan Pérez",
      email: "estudiante1@pasantias.com",
      password,
      role: "ESTUDIANTE",
      dni: "40123456",
      legajo: "SIS-2020-1234",
      carreraId: carrera1.id,
      anioCursada: "4to",
      promedio: "8.5",
    },
  })

  const estudiante2 = await prisma.user.upsert({
    where: { email: "estudiante2@pasantias.com" },
    update: {},
    create: {
      name: "María García",
      email: "estudiante2@pasantias.com",
      password,
      role: "ESTUDIANTE",
      dni: "41234567",
      legajo: "SIS-2021-5678",
      carreraId: carrera1.id,
      anioCursada: "3ro",
      promedio: "9.0",
    },
  })

  console.log("✅ Usuarios creados")

  // ─── Pasantías ──────────────────────────────────────
  type PasantiaSeed = {
    titulo: string; descripcion: string; requisitos: string; area: string
    modalidad: string; duracion: string; becaEconomica: string; cargaHoraria?: string
    vacantes: number; empresaId: string; estado: "PUBLICADA"; activo: boolean
  }

  const pasantias: PasantiaSeed[] = [
    { titulo: "Pasante de Desarrollo Web Full Stack", descripcion: "Trabajarás con tecnologías modernas como React, Node.js y PostgreSQL en proyectos reales.", requisitos: "Conocimientos básicos de JS/TS. Estudiante de sistemas o carreras afines.", area: "tecnologia", modalidad: "HIBRIDA", duracion: "6 meses", becaEconomica: "80000", cargaHoraria: "20 hs semanales", vacantes: 2, empresaId: empresa1.id, estado: "PUBLICADA", activo: true },
    { titulo: "Pasante de Marketing Digital", descripcion: "Manejo de redes sociales, creación de contenido y análisis de métricas.", requisitos: "Estudiante de marketing, comunicación o carreras afines.", area: "marketing", modalidad: "REMOTA", duracion: "4 meses", becaEconomica: "50000", vacantes: 1, empresaId: empresa1.id, estado: "PUBLICADA", activo: true },
    { titulo: "Pasante de Administración", descripcion: "Colaboración en tareas administrativas generales, archivo y apoyo a la gestión.", requisitos: "Estudiante de administración. Manejo de Office.", area: "administracion", modalidad: "PRESENCIAL", duracion: "3 meses", becaEconomica: "40000", vacantes: 1, empresaId: empresa2.id, estado: "PUBLICADA", activo: true },
    { titulo: "Pasante Legal", descripcion: "Asistencia en preparación de documentos legales e investigación de jurisprudencia.", requisitos: "Estudiante avanzado de abogacía.", area: "legal", modalidad: "PRESENCIAL", duracion: "4 meses", becaEconomica: "55000", vacantes: 2, empresaId: empresa2.id, estado: "PUBLICADA", activo: true },
  ]

  for (const p of pasantias) {
    await prisma.pasantia.create({ data: p })
  }
  console.log("✅ Pasantías creadas:", pasantias.length)

  console.log("\n🎉 Seed completado!")
  console.log("\n📧 Credenciales:")
  console.log("   Admin:        admin@pasantias.com / 123456")
  console.log("   Empresa:      techcorp@pasantias.com / 123456")
  console.log("   Empresa:      estudio@pasantias.com / 123456")
  console.log("   Estudiante:   estudiante1@pasantias.com / 123456")
  console.log("   Estudiante:   estudiante2@pasantias.com / 123456")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
