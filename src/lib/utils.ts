import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—"
  const d = new Date(date)
  if (isNaN(d.getTime())) return "—"
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
  }).format(d)
}

export function calcularPromedio(puntuaciones: number[]) {
  if (puntuaciones.length === 0) return 0
  return puntuaciones.reduce((a, b) => a + b, 0) / puntuaciones.length
}
