import { prisma } from "@/lib/prisma"
import { generarFirmaElectronica } from "@/lib/firma"
import type { EstadoPasantia } from "@prisma/client"
import bcrypt from "bcryptjs"

function diasAtras(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function diasAdelante(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d
}

async function main() {
  console.log("🌱 Iniciando seed...")

  // ─── Limpieza previa (orden inverso de dependencias) ──
  await prisma.auditLog.deleteMany()
  await prisma.pushSubscription.deleteMany()
  await prisma.notificacion.deleteMany()
  await prisma.mensaje.deleteMany()
  await prisma.conversacion.deleteMany()
  await prisma.documento.deleteMany()
  await prisma.evaluacion.deleteMany()
  await prisma.registroHoras.deleteMany()
  await prisma.planTrabajo.deleteMany()
  await prisma.seguimiento.deleteMany()
  await prisma.seguro.deleteMany()
  await prisma.convenio.deleteMany()
  await prisma.postulacion.deleteMany()
  await prisma.pasantia.deleteMany()
  await prisma.user.deleteMany()
  await prisma.carrera.deleteMany()
  await prisma.facultad.deleteMany()
  await prisma.convenioMarco.deleteMany()
  await prisma.empresa.deleteMany()
  await prisma.universidad.deleteMany()
  console.log("🗑️  Base limpiada")

  const password = await bcrypt.hash("123456", 10)

  // ─── Admin ──────────────────────────────────────────
  await prisma.user.create({
    data: { name: "Admin", email: "admin@pasantias.com", password, role: "ADMIN", verified: true },
  })

  // ─── Universidad / Facultad / Carrera ───────────────
  const univ = await prisma.universidad.create({
    data: { nombre: "Universidad Nacional de Tucumán", email: "contacto@unt.edu.ar" },
  })

  const face = await prisma.facultad.create({
    data: { nombre: "Facultad de Ciencias Exactas (FACE)", universidadId: univ.id },
  })

  const carrera1 = await prisma.carrera.create({
    data: { nombre: "Lic. en Sistemas de Información", facultadId: face.id },
  })
  await prisma.carrera.create({
    data: { nombre: "Lic. en Matemática", facultadId: face.id },
  })

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

  console.log("✅ Universidad y empresas creadas")

  // ─── Usuarios ───────────────────────────────────────
  const userUniv = await prisma.user.create({
    data: {
      name: "Universidad Nacional de Tucumán",
      email: "universidad@pasantias.com",
      password,
      role: "UNIVERSIDAD",
      universidadId: univ.id,
      verified: true,
    },
  })

  const userEmpresa1 = await prisma.user.create({
    data: {
      name: "TechCorp Argentina",
      email: "techcorp@pasantias.com",
      password,
      role: "EMPRESA",
      empresaId: empresa1.id,
      verified: true,
    },
  })

  await prisma.user.create({
    data: {
      name: "Estudio Jurídico Pérez & Asoc.",
      email: "estudio@pasantias.com",
      password,
      role: "EMPRESA",
      empresaId: empresa2.id,
      verified: true,
    },
  })

  const tutorAcademico = await prisma.user.create({
    data: {
      name: "Lic. Ricardo Sosa",
      email: "tutor-academico@pasantias.com",
      password,
      role: "TUTOR_ACADEMICO",
      universidadId: univ.id,
      carreraId: carrera1.id,
      dni: "25123456",
      verified: true,
    },
  })

  const tutorEmpresa = await prisma.user.create({
    data: {
      name: "Ing. Carla Méndez",
      email: "tutor-empresa@pasantias.com",
      password,
      role: "TUTOR_EMPRESA",
      empresaId: empresa1.id,
      dni: "27876543",
      verified: true,
    },
  })

  const estudiante1 = await prisma.user.create({
    data: {
      name: "Juan Pérez",
      email: "estudiante1@pasantias.com",
      password,
      role: "ESTUDIANTE",
      dni: "40123456",
      fechaNacimiento: diasAtras(7000),
      legajo: "SIS-2020-1234",
      carreraId: carrera1.id,
      anioCursada: "4to",
      promedio: "8.5",
      habilidades: "JavaScript, TypeScript, React, Node.js, PostgreSQL",
      materiasAprobadas: "Programación I, Programación II, Bases de Datos, Sistemas Operativos",
      cvUrl: "/cv/juan-perez.pdf",
      verified: true,
    },
  })

  const estudiante2 = await prisma.user.create({
    data: {
      name: "María García",
      email: "estudiante2@pasantias.com",
      password,
      role: "ESTUDIANTE",
      dni: "41234567",
      fechaNacimiento: diasAtras(6900),
      legajo: "SIS-2021-5678",
      carreraId: carrera1.id,
      anioCursada: "3ro",
      promedio: "9.0",
      habilidades: "Marketing digital, redes sociales, diseño gráfico, análisis de métricas",
      materiasAprobadas: "Comunicación, Introducción al Marketing, Estadística",
      verified: true,
    },
  })

  console.log("✅ Usuarios creados")

  // ─── Convenio Marco (universidad-empresa) ───────────
  await prisma.convenioMarco.create({
    data: {
      universidadId: univ.id,
      empresaId: empresa1.id,
      fechaInicio: diasAtras(365),
      fechaFin: diasAdelante(365),
      estado: "ACTIVO",
    },
  })
  console.log("✅ Convenio marco creado")

  // ─── Pasantías ──────────────────────────────────────
  type PasantiaSeed = {
    titulo: string; descripcion: string; requisitos: string; area: string
    modalidad: string; duracion: string; becaEconomica: string; cargaHoraria?: string
    vacantes: number; empresaId: string; estado: EstadoPasantia; activo: boolean
  }

  const pasantias: PasantiaSeed[] = [
    { titulo: "Pasante de Desarrollo Web Full Stack", descripcion: "Trabajarás con tecnologías modernas como React, Node.js y PostgreSQL en proyectos reales.", requisitos: "Conocimientos básicos de JS/TS. Estudiante de sistemas o carreras afines.", area: "tecnologia", modalidad: "HIBRIDA", duracion: "6 meses", becaEconomica: "80000", cargaHoraria: "20 hs semanales", vacantes: 2, empresaId: empresa1.id, estado: "ACTIVA", activo: true },
    { titulo: "Pasante de Marketing Digital", descripcion: "Manejo de redes sociales, creación de contenido y análisis de métricas.", requisitos: "Estudiante de marketing, comunicación o carreras afines.", area: "marketing", modalidad: "REMOTA", duracion: "4 meses", becaEconomica: "50000", vacantes: 1, empresaId: empresa1.id, estado: "PUBLICADA", activo: true },
    { titulo: "Pasante de Administración", descripcion: "Colaboración en tareas administrativas generales, archivo y apoyo a la gestión.", requisitos: "Estudiante de administración. Manejo de Office.", area: "administracion", modalidad: "PRESENCIAL", duracion: "3 meses", becaEconomica: "40000", vacantes: 1, empresaId: empresa2.id, estado: "PUBLICADA", activo: true },
    { titulo: "Pasante Legal", descripcion: "Asistencia en preparación de documentos legales e investigación de jurisprudencia.", requisitos: "Estudiante avanzado de abogacía.", area: "legal", modalidad: "PRESENCIAL", duracion: "4 meses", becaEconomica: "55000", vacantes: 2, empresaId: empresa2.id, estado: "PUBLICADA", activo: true },
  ]

  const pasantia1 = await prisma.pasantia.create({ data: pasantias[0] })
  const pasantia2 = await prisma.pasantia.create({ data: pasantias[1] })
  await prisma.pasantia.create({ data: pasantias[2] })
  const pasantia4 = await prisma.pasantia.create({ data: pasantias[3] })
  console.log("✅ Pasantías creadas:", pasantias.length)

  // ─── Postulaciones ──────────────────────────────────
  const postulacion1 = await prisma.postulacion.create({
    data: {
      alumnoId: estudiante1.id,
      pasantiaId: pasantia1.id,
      estado: "ACEPTADO",
      mensaje: "Me interesa mucho esta pasantía, tengo experiencia con React y Node.js.",
      tutorAcademicoId: tutorAcademico.id,
      tutorEmpresaId: tutorEmpresa.id,
    },
  })

  await prisma.postulacion.create({
    data: {
      alumnoId: estudiante2.id,
      pasantiaId: pasantia2.id,
      estado: "REVISADO",
      mensaje: "Soy estudiante de 3er año y manejo redes sociales.",
    },
  })

  await prisma.postulacion.create({
    data: {
      alumnoId: estudiante1.id,
      pasantiaId: pasantia4.id,
      estado: "PENDIENTE",
      mensaje: "Postulación de prueba.",
    },
  })
  console.log("✅ Postulaciones creadas")

  // ─── Convenio tripartito (firmado) ──────────────────
  const convenio = await prisma.convenio.create({
    data: {
      postulacionId: postulacion1.id,
      estado: "COMPLETADO",
      firmaAlumno: true,
      firmaEmpresa: true,
      firmaUniversidad: true,
    },
  })

  const firmaAlumno = generarFirmaElectronica({
    convenioId: convenio.id,
    postulacionId: postulacion1.id,
    pasantiaTitulo: pasantia1.titulo,
    parte: "alumno",
    usuarioId: estudiante1.id,
    usuarioNombre: estudiante1.name,
  })
  const firmaEmpresa = generarFirmaElectronica({
    convenioId: convenio.id,
    postulacionId: postulacion1.id,
    pasantiaTitulo: pasantia1.titulo,
    parte: "empresa",
    usuarioId: userEmpresa1.id,
    usuarioNombre: userEmpresa1.name,
  })
  const firmaUniversidad = generarFirmaElectronica({
    convenioId: convenio.id,
    postulacionId: postulacion1.id,
    pasantiaTitulo: pasantia1.titulo,
    parte: "universidad",
    usuarioId: userUniv.id,
    usuarioNombre: userUniv.name,
  })

  await prisma.convenio.update({
    where: { id: convenio.id },
    data: {
      firmaAlumnoHash: firmaAlumno.hash,
      firmaAlumnoFecha: firmaAlumno.fecha,
      firmaEmpresaHash: firmaEmpresa.hash,
      firmaEmpresaFecha: firmaEmpresa.fecha,
      firmaUniversidadHash: firmaUniversidad.hash,
      firmaUniversidadFecha: firmaUniversidad.fecha,
    },
  })

  // ─── Seguimientos del convenio ──────────────────────
  await prisma.seguimiento.create({
    data: { convenioId: convenio.id, usuarioId: userUniv.id, descripcion: "Convenio firmado por las tres partes." },
  })

  // ─── Plan de trabajo ────────────────────────────────
  await prisma.planTrabajo.create({
    data: {
      convenioId: convenio.id,
      usuarioId: tutorAcademico.id,
      objetivos: "Desarrollar componentes frontend y APIs en proyectos reales de la empresa.",
      horasSemana: 20,
      fechaInicio: diasAtras(60),
      fechaFin: diasAdelante(120),
    },
  })
  console.log("✅ Convenio, seguimiento y plan de trabajo creados")

  // ─── Seguro vigente ─────────────────────────────────
  await prisma.seguro.create({
    data: {
      postulacionId: postulacion1.id,
      compania: "La Caja ART",
      poliza: "ART-2026-00442",
      coberturaDesde: diasAtras(90),
      coberturaHasta: diasAdelante(270),
      archivo: "/seguros/art-2026-00442.pdf",
    },
  })
  console.log("✅ Seguro creado")

  // ─── Registro de horas (dentro del plan) ────────────
  await prisma.registroHoras.createMany({
    data: [
      { convenioId: convenio.id, usuarioId: estudiante1.id, fecha: diasAtras(7), horas: 5, descripcion: "Desarrollo de API REST" },
      { convenioId: convenio.id, usuarioId: estudiante1.id, fecha: diasAtras(6), horas: 4, descripcion: "Componentes React" },
      { convenioId: convenio.id, usuarioId: estudiante1.id, fecha: diasAtras(5), horas: 5, descripcion: "Revisiones de código" },
      { convenioId: convenio.id, usuarioId: estudiante1.id, fecha: diasAtras(4), horas: 6, descripcion: "Pruebas y QA" },
    ],
  })

  // ─── Evaluación intermedia ──────────────────────────
  await prisma.evaluacion.create({
    data: {
      convenioId: convenio.id,
      autorId: tutorEmpresa.id,
      tipo: "INTERMEDIO_EMPRESA",
      puntaje: 8,
      comentario: "Buen desempeño, cumple con los objetivos del plan de trabajo.",
      fecha: diasAtras(15),
    },
  })
  console.log("✅ Horas y evaluación creadas")

  // ─── Conversación de la postulación ─────────────────
  const conversacion = await prisma.conversacion.create({
    data: { postulacionId: postulacion1.id },
  })
  await prisma.mensaje.createMany({
    data: [
      { conversacionId: conversacion.id, autorId: estudiante1.id, texto: "Hola, quiero saber cuándo arranco.", fecha: diasAtras(3) },
      { conversacionId: conversacion.id, autorId: tutorEmpresa.id, texto: "Bienvenido! Arrancamos el lunes a las 9hs.", fecha: diasAtras(2) },
    ],
  })
  console.log("✅ Conversación creada")

  // ─── Documentos de estudiantes ──────────────────────
  await prisma.documento.createMany({
    data: [
      { usuarioId: estudiante1.id, nombre: "CV Juan Pérez", tipo: "CV", url: "https://drive.google.com/...", verificado: true },
      { usuarioId: estudiante1.id, nombre: "Alumno regular 2026", tipo: "ALUMNO_REGULAR", url: "https://drive.google.com/...", verificado: true },
      { usuarioId: estudiante1.id, nombre: "Analítico parcial", tipo: "ANALITICO_PARCIAL", url: "https://drive.google.com/...", verificado: true },
      { usuarioId: estudiante1.id, nombre: "Salud psicofísica", tipo: "SALUD", url: "https://drive.google.com/...", verificado: true },
      { usuarioId: estudiante2.id, nombre: "CV María García", tipo: "CV", url: "/cv/maria-garcia.pdf", verificado: true },
    ],
  })

  // ─── Auditoría de ejemplo ───────────────────────────
  await prisma.auditLog.create({
    data: { usuarioId: userUniv.id, accion: "APROBAR_CONVENIO", tabla: "Convenio", registroId: convenio.id, detalle: "Convenio tripartito aprobado por la universidad." },
  })
  console.log("✅ Documentos y auditoría creados")

  console.log("\n🎉 Seed completado!")
  console.log("\n📧 Credenciales (todas con contraseña 123456):")
  console.log("   Admin:           admin@pasantias.com")
  console.log("   Universidad:     universidad@pasantias.com")
  console.log("   TechCorp:        techcorp@pasantias.com")
  console.log("   Estudio Jurídico:estudio@pasantias.com")
  console.log("   Tutor académico: tutor-academico@pasantias.com")
  console.log("   Tutor empresa:   tutor-empresa@pasantias.com")
  console.log("   Estudiante 1:    estudiante1@pasantias.com")
  console.log("   Estudiante 2:    estudiante2@pasantias.com")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
