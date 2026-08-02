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

export const AREAS_MAP: Record<string, string> = Object.fromEntries(
  AREAS.map((a) => [a.value, a.label]),
)

export const AREA_COLORS: Record<string, string> = {
  tecnologia: "bg-blue-50 text-blue-700",
  administracion: "bg-indigo-50 text-indigo-700",
  contabilidad: "bg-emerald-50 text-emerald-700",
  marketing: "bg-pink-50 text-pink-700",
  diseno: "bg-purple-50 text-purple-700",
  educacion: "bg-amber-50 text-amber-700",
  salud: "bg-teal-50 text-teal-700",
  ingenieria: "bg-cyan-50 text-cyan-700",
  "recursos-humanos": "bg-rose-50 text-rose-700",
  comunicacion: "bg-sky-50 text-sky-700",
  legal: "bg-violet-50 text-violet-700",
  comercial: "bg-orange-50 text-orange-700",
  produccion: "bg-lime-50 text-lime-700",
  logistica: "bg-slate-50 text-slate-700",
  otro: "bg-gray-50 text-gray-700",
}

export function getAreaLabel(area: string) {
  return AREAS_MAP[area] ?? area
}

export function getAreaColor(area: string) {
  return AREA_COLORS[area] ?? "bg-gray-50 text-gray-700"
}

export const MODALIDADES_MAP: Record<string, string> = Object.fromEntries(
  MODALIDADES.map((m) => [m.value, m.label]),
)

export const MODALIDAD_COLORS: Record<string, string> = {
  PRESENCIAL: "bg-gray-100 text-gray-700",
  HIBRIDA: "bg-amber-50 text-amber-700",
  REMOTA: "bg-sky-50 text-sky-700",
}

export function getModalidadLabel(modalidad: string) {
  return MODALIDADES_MAP[modalidad] ?? modalidad
}

export function getModalidadColor(modalidad: string) {
  return MODALIDAD_COLORS[modalidad] ?? "bg-gray-100 text-gray-700"
}

export const PROVINCIAS_ARGENTINA = [
  "Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba",
  "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa",
  "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro",
  "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe",
  "Santiago del Estero", "Tierra del Fuego", "Tucumán",
] as const

export const ESTADOS_PASANTIA: Record<string, { label: string; color: string }> = {
  BORRADOR: { label: "Borrador", color: "bg-gray-100 text-gray-800" },
  PUBLICADA: { label: "Publicada", color: "bg-blue-100 text-blue-800" },
  SELECCION: { label: "Selección", color: "bg-yellow-100 text-yellow-800" },
  ESPERA_CONVENIO: { label: "Espera convenio", color: "bg-purple-100 text-purple-800" },
  ACTIVA: { label: "Activa", color: "bg-green-100 text-green-800" },
  FINALIZADA: { label: "Finalizada", color: "bg-gray-100 text-gray-800" },
  CANCELADA: { label: "Cancelada", color: "bg-red-100 text-red-800" },
}

export const ESTADOS_POSTULACION: Record<string, { label: string; color: string }> = {
  PENDIENTE: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  REVISADO: { label: "Revisado", color: "bg-blue-100 text-blue-800" },
  ACEPTADO: { label: "Aceptado", color: "bg-green-100 text-green-800" },
  RECHAZADO: { label: "Rechazado", color: "bg-red-100 text-red-800" },
}

export const TIPOS_DOCUMENTO: Record<string, string> = {
  CV: "Currículum Vitae",
  DNI: "DNI",
  ANALITICO: "Analítico",
  ANALITICO_PARCIAL: "Certificado analítico parcial",
  ALUMNO_REGULAR: "Certificado de alumno regular",
  SALUD: "Certificado de salud psicofísica",
  CONVENIO: "Convenio",
  SEGURO: "Seguro",
  OTRO: "Otro",
}
