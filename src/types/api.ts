export interface ApiError {
  error: string
}

export interface ApiSuccess {
  success: true
}

export interface Paginated<T> {
  data: T[]
  total: number
}

export interface Notificacion {
  id: string
  titulo: string
  mensaje: string | null
  link: string | null
  leida: boolean
  createdAt: string
}
