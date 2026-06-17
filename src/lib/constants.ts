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
  CV: "CV",
  DNI: "DNI",
  ANALITICO: "Analítico",
  ALUMNO_REGULAR: "Alumno Regular",
  CONVENIO: "Convenio",
  SEGURO: "Seguro",
}
