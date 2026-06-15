import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

async function main() {
  console.log("🌱 Iniciando seed...")

  const password = await bcrypt.hash("123456", 12)

  const admin = await prisma.user.upsert({
    where: { email: "admin@pasantias.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@pasantias.com",
      password,
      role: "ADMIN",
      verified: true,
    },
  })
  console.log("✅ Admin creado:", admin.email)

  const inst1 = await prisma.institucion.upsert({
    where: { nombre: "TechCorp Argentina" },
    update: {},
    create: {
      nombre: "TechCorp Argentina",
      descripcion: "Empresa líder en desarrollo de software con más de 10 años en el mercado argentino. Especialistas en soluciones web y móviles.",
      direccion: "Av. Corrientes 1234, CABA",
      ciudad: "CABA",
      provincia: "Buenos Aires",
      sitioWeb: "https://techcorp.com.ar",
      verificada: true,
    },
  })

  const inst2 = await prisma.institucion.upsert({
    where: { nombre: "Universidad Nacional" },
    update: {},
    create: {
      nombre: "Universidad Nacional",
      descripcion: "Universidad pública con más de 50 años de trayectoria en educación superior.",
      direccion: "Calle Principal 567",
      ciudad: "Córdoba",
      provincia: "Córdoba",
      verificada: true,
    },
  })

  const inst3 = await prisma.institucion.upsert({
    where: { nombre: "Estudio Jurídico Pérez & Asoc." },
    update: {},
    create: {
      nombre: "Estudio Jurídico Pérez & Asoc.",
      descripcion: "Estudio jurídico especializado en derecho corporativo y comercial.",
      direccion: "San Martín 890",
      ciudad: "Rosario",
      provincia: "Santa Fe",
    },
  })

  const instUser1 = await prisma.user.upsert({
    where: { email: "techcorp@pasantias.com" },
    update: {},
    create: {
      name: "TechCorp Argentina",
      email: "techcorp@pasantias.com",
      password,
      role: "INSTITUCION",
      institucionId: inst1.id,
      verified: true,
    },
  })

  const instUser2 = await prisma.user.upsert({
    where: { email: "universidad@pasantias.com" },
    update: {},
    create: {
      name: "Universidad Nacional",
      email: "universidad@pasantias.com",
      password,
      role: "INSTITUCION",
      institucionId: inst2.id,
      verified: true,
    },
  })

  const instUser3 = await prisma.user.upsert({
    where: { email: "estudio@pasantias.com" },
    update: {},
    create: {
      name: "Estudio Jurídico Pérez & Asoc.",
      email: "estudio@pasantias.com",
      password,
      role: "INSTITUCION",
      institucionId: inst3.id,
    },
  })

  console.log("✅ Instituciones creadas")

  const estudiante1 = await prisma.user.upsert({
    where: { email: "estudiante1@pasantias.com" },
    update: {},
    create: {
      name: "Juan Pérez",
      email: "estudiante1@pasantias.com",
      password,
      role: "ESTUDIANTE",
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
    },
  })

  console.log("✅ Estudiantes creados")

  const pasantias = [
    {
      titulo: "Pasante de Desarrollo Web Full Stack",
      descripcion: "Buscamos un pasante entusiasta para sumarse a nuestro equipo de desarrollo. Trabajarás con tecnologías modernas como React, Node.js y PostgreSQL en proyectos reales.",
      requisitos: "Conocimientos básicos de JavaScript/TypeScript. Ganas de aprender. Estudiante de sistemas o carreras afines.",
      area: "tecnologia",
      modalidad: "HIBRIDA",
      duracion: "6 meses",
      becaEconomica: "80000",
      cargaHoraria: "20 hs semanales",
      vacantes: 2,
      institucionId: instUser1.id,
    },
    {
      titulo: "Pasante de Marketing Digital",
      descripcion: "Buscamos pasante para el área de marketing digital. Manejo de redes sociales, creación de contenido y análisis de métricas.",
      requisitos: "Estudiante de marketing, comunicación o carreras afines. Conocimiento de redes sociales.",
      area: "marketing",
      modalidad: "REMOTA",
      duracion: "4 meses",
      becaEconomica: "50000",
      cargaHoraria: "15 hs semanales",
      vacantes: 1,
      institucionId: instUser1.id,
    },
    {
      titulo: "Pasante de Administración",
      descripcion: "Colaboración en tareas administrativas generales, archivo, atención al público y apoyo a la gestión.",
      requisitos: "Estudiante de administración de empresas o carreras afines. Buena presencia y manejo de Office.",
      area: "administracion",
      modalidad: "PRESENCIAL",
      duracion: "3 meses",
      becaEconomica: "40000",
      cargaHoraria: "20 hs semanales",
      vacantes: 1,
      institucionId: instUser2.id,
    },
    {
      titulo: "Pasante de Diseño Gráfico",
      descripcion: "Buscamos pasante para crear piezas gráficas, editar imágenes y asistir en la producción de contenido visual.",
      requisitos: "Manejo de Adobe Illustrator, Photoshop y/o Figma. Portfolio básico.",
      area: "diseno",
      modalidad: "HIBRIDA",
      duracion: "4 meses",
      becaEconomica: "60000",
      cargaHoraria: "20 hs semanales",
      vacantes: 1,
      institucionId: instUser2.id,
    },
    {
      titulo: "Pasante de Recursos Humanos",
      descripcion: "Apoyo en procesos de selección, entrevistas, onboarding y administración de personal.",
      requisitos: "Estudiante de RRHH o psicología laboral. Buen manejo de relaciones interpersonales.",
      area: "recursos-humanos",
      modalidad: "PRESENCIAL",
      duracion: "6 meses",
      becaEconomica: "45000",
      cargaHoraria: "20 hs semanales",
      vacantes: 1,
      institucionId: instUser3.id,
    },
    {
      titulo: "Pasante Legal",
      descripcion: "Asistencia en la preparación de documentos legales, investigación de jurisprudencia y apoyo en causas.",
      requisitos: "Estudiante avanzado de abogacía. Conocimiento de derecho comercial.",
      area: "legal",
      modalidad: "PRESENCIAL",
      duracion: "4 meses",
      becaEconomica: "55000",
      cargaHoraria: "15 hs semanales",
      vacantes: 2,
      institucionId: instUser3.id,
    },
  ]

  for (const p of pasantias) {
    await prisma.pasantia.create({ data: p })
  }

  console.log("✅ Pasantías creadas:", pasantias.length)

  const pasantiasCreadas = await prisma.pasantia.findMany({ take: 3 })

  await prisma.resena.create({
    data: {
      puntuacion: 5,
      comentario: "Excelente experiencia de aprendizaje. Muy buen equipo de trabajo.",
      pasantiaId: pasantiasCreadas[0].id,
      emisorId: estudiante1.id,
      receptorId: instUser1.id,
    },
  })

  await prisma.resena.create({
    data: {
      puntuacion: 4,
      comentario: "Buena pasantía, aprendí mucho sobre desarrollo web.",
      pasantiaId: pasantiasCreadas[0].id,
      emisorId: estudiante2.id,
      receptorId: instUser1.id,
    },
  })

  console.log("✅ Reseñas creadas")

  console.log("\n🎉 Seed completado exitosamente!")
  console.log("\n📧 Credenciales de prueba:")
  console.log("   Admin: admin@pasantias.com / 123456")
  console.log("   Institución: techcorp@pasantias.com / 123456")
  console.log("   Institución: universidad@pasantias.com / 123456")
  console.log("   Institución: estudio@pasantias.com / 123456")
  console.log("   Estudiante: estudiante1@pasantias.com / 123456")
  console.log("   Estudiante: estudiante2@pasantias.com / 123456")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
