export const AREAS = [
  { value: "tecnologia", label: "Tecnología" },
  { value: "administracion", label: "Administración" },
  { value: "contabilidad", label: "Contabilidad" },
  { value: "marketing", label: "Marketing" },
  { value: "diseno", label: "Diseño" },
  { value: "educacion", label: "Educación" },
  { value: "salud", label: "Salud" },
  { value: "ingenieria", label: "Ingeniería" },
  { value: "recursos-humanos", label: "Recursos Humanos" },
  { value: "comunicacion", label: "Comunicación" },
  { value: "legal", label: "Legal" },
  { value: "comercial", label: "Comercial" },
  { value: "produccion", label: "Producción" },
  { value: "logistica", label: "Logística" },
  { value: "otro", label: "Otro" },
] as const

export const MODALIDADES = [
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "HIBRIDA", label: "Híbrida" },
  { value: "REMOTA", label: "Remota" },
] as const

export const PROVINCIAS_ARGENTINA = [
  "Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba",
  "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa",
  "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro",
  "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe",
  "Santiago del Estero", "Tierra del Fuego", "Tucumán",
] as const

export const ESTADOS_POSTULACION = {
  PENDIENTE: { label: "Pendiente", color: "warning" },
  REVISADO: { label: "Revisado", color: "secondary" },
  ACEPTADO: { label: "Aceptado", color: "success" },
  RECHAZADO: { label: "Rechazado", color: "destructive" },
} as const
