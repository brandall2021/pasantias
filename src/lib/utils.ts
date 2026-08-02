import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatARS(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return null
  const n =
    typeof value === "string" ? Number(value.replace(/[^0-9.]/g, "")) : value
  if (!Number.isFinite(n) || n === 0) return null
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n)
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

export function timeAgo(date: Date | string): string {
  const d = new Date(date)
  const secs = Math.floor((Date.now() - d.getTime()) / 1000)
  if (secs < 60) return "ahora"
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `hace ${days} d`
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" })
}
