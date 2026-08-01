import { z } from "zod"
import { Role, PostulacionEstado } from "@prisma/client"

export const emailSchema = z.string().email()

export const passwordSchema = z.string().min(6, "La contraseña debe tener al menos 6 caracteres")

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum([Role.ESTUDIANTE, Role.EMPRESA, Role.UNIVERSIDAD]),
  phone: z.string().optional(),
  dni: z.string().optional(),
  fechaNacimiento: z.string().optional(),
  direccion: z.string().optional(),
  legajo: z.string().optional(),
  anioCursada: z.string().optional(),
  promedio: z.string().optional(),
  habilidades: z.string().optional(),
  cvUrl: z.string().optional(),
  materiasAprobadas: z.string().optional(),
  carreraId: z.string().optional(),
  universidadId: z.string().optional(),
  universidadNombre: z.string().optional(),
  empresaId: z.string().optional(),
  empresa: z.object({ nombre: z.string(), cuit: z.string() }).optional(),
  empresaNombre: z.string().optional(),
  cuit: z.string().optional(),
})

export const cambiarPasswordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida"),
  newPassword: passwordSchema,
})

export const recuperarSchema = z.object({
  email: emailSchema,
})

export const restablecerSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
})

export const pasantiaSchema = z.object({
  titulo: z.string().min(3, "El título es requerido"),
  descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  requisitos: z.string().optional(),
  area: z.string().min(1, "El área es requerida"),
  modalidad: z.string().default("PRESENCIAL"),
  duracion: z.string().optional(),
  becaEconomica: z.string().optional(),
  cargaHoraria: z.string().optional(),
  vacantes: z.coerce.number().int().positive().default(1),
  unidadAcademicaId: z.string().optional(),
})

export const postulacionSchema = z.object({
  pasantiaId: z.string().min(1),
  mensaje: z.string().optional(),
  documentoIds: z.array(z.string()).optional(),
})

export const updatePostulacionSchema = z
  .object({
    estado: z.enum(Object.values(PostulacionEstado) as [string, ...string[]]).optional(),
    tutorAcademicoId: z.string().nullable().optional(),
    tutorEmpresaId: z.string().nullable().optional(),
  })
  .refine((d) => d.estado || d.tutorAcademicoId !== undefined || d.tutorEmpresaId !== undefined, {
    message: "Debe enviar al menos un campo",
  })

export const convenioFirmarSchema = z.object({
  parte: z.enum(["alumno", "empresa", "universidad"]),
})

export const seguimientoSchema = z.object({
  descripcion: z.string().min(3, "La descripción es requerida"),
})

export const evaluacionSchema = z.object({
  tipo: z.string().min(1),
  puntaje: z.coerce.number().int().min(1).max(5),
  comentario: z.string().optional(),
})

export const convenioMarcoSchema = z.object({
  empresaId: z.string().min(1),
  universidadId: z.string().optional(),
  fechaInicio: z.string().min(1),
  fechaFin: z.string().optional(),
  archivo: z.string().optional(),
})

export const seguroSchema = z.object({
  postulacionId: z.string().min(1),
  compania: z.string().min(1),
  poliza: z.string().min(1),
  coberturaDesde: z.string().min(1),
  coberturaHasta: z.string().min(1),
  archivo: z.string().optional(),
})

export const planTrabajoSchema = z.object({
  convenioId: z.string().min(1),
  objetivos: z.string().min(3),
  horasSemana: z.coerce.number().int().positive(),
  fechaInicio: z.string().min(1),
  fechaFin: z.string().min(1),
})

export const registroHorasSchema = z.object({
  convenioId: z.string().min(1),
  horas: z.coerce.number().int().min(1).max(24),
  descripcion: z.string().optional(),
  fecha: z.string().optional(),
})

export const mensajeSchema = z.object({
  texto: z.string().min(1, "El mensaje no puede estar vacío").max(2000),
  postulacionId: z.string().min(1),
})

export function parseDate(value: string): Date | null {
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}
