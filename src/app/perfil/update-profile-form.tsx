"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export interface ProfileUser {
  id: string
  role: string
  name: string | null
  email: string | null
  phone: string | null
  direccion: string | null
  dni: string | null
  fechaNacimiento: Date | string | null
  legajo: string | null
  anioCursada: string | null
  promedio: string | null
  habilidades: string | null
  cvUrl: string | null
  materiasAprobadas: string | null
  carrera?: { nombre: string } | null
  empresa?: { nombre: string; direccion: string | null } | null
}

export function UpdateProfileForm({ user }: { user: ProfileUser }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const formData = new FormData(e.currentTarget)

    try {
      const body: Record<string, unknown> = {
        id: user.id,
        name: formData.get("name"),
        phone: formData.get("phone") || undefined,
        direccion: formData.get("direccion") || undefined,
      }

      if (user.role === "ESTUDIANTE") {
        body.dni = formData.get("dni") || undefined
        body.fechaNacimiento = formData.get("fechaNacimiento") || undefined
        body.direccion = formData.get("direccion") || undefined
        body.legajo = formData.get("legajo") || undefined
        body.anioCursada = formData.get("anioCursada") || undefined
        body.promedio = formData.get("promedio") || undefined
        body.habilidades = formData.get("habilidades") || undefined
        body.cvUrl = formData.get("cvUrl") || undefined
        body.materiasAprobadas = formData.get("materiasAprobadas") || undefined
      }

      const res = await fetch("/api/instituciones", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setMessage("Perfil actualizado")
        router.refresh()
      } else {
        setMessage("Error al actualizar")
      }
    } catch {
      setMessage("Error al actualizar")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <p className={`text-sm p-3 rounded ${message.includes("Error") ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"}`}>
          {message}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="name">Nombre completo</Label>
        <Input id="name" name="name" defaultValue={user.name || ""} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={user.email || ""} disabled className="bg-gray-50" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" name="phone" defaultValue={user.phone || ""} />
      </div>

      {user.role === "EMPRESA" && user.empresa && (
        <>
          <div className="space-y-2">
            <Label>Empresa</Label>
            <Input value={user.empresa.nombre} disabled className="bg-gray-50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input id="direccion" name="direccion" defaultValue={user.empresa.direccion || ""} />
          </div>
        </>
      )}

      {user.role === "ESTUDIANTE" && (
        <>
          <div className="border-t pt-4 mt-2">
            <p className="text-sm font-medium text-gray-500 mb-3">Información personal</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dni">DNI / Pasaporte</Label>
            <Input id="dni" name="dni" defaultValue={user.dni || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
            <Input id="fechaNacimiento" name="fechaNacimiento" type="date" defaultValue={user.fechaNacimiento ? String(user.fechaNacimiento).split("T")[0] : ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección de residencia</Label>
            <Input id="direccion" name="direccion" defaultValue={user.direccion || ""} placeholder="Ciudad, calle y código postal" />
          </div>

          <div className="border-t pt-4 mt-2">
            <p className="text-sm font-medium text-gray-500 mb-3">Datos académicos</p>
          </div>
          {user.carrera && (
            <div className="space-y-2">
              <Label>Carrera</Label>
              <Input value={user.carrera.nombre || ""} disabled className="bg-gray-50" />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="legajo">N° de matrícula / Legajo</Label>
            <Input id="legajo" name="legajo" defaultValue={user.legajo || ""} placeholder="Identificador único del alumno" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="anioCursada">Año de cursada / % materias aprobadas</Label>
            <Input id="anioCursada" name="anioCursada" defaultValue={user.anioCursada || ""} placeholder="Ej: 3er año, 60%" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="promedio">Promedio general</Label>
            <Input id="promedio" name="promedio" defaultValue={user.promedio || ""} placeholder="Ej: 8.5" />
          </div>

          <div className="border-t pt-4 mt-2">
            <p className="text-sm font-medium text-gray-500 mb-3">Historial laboral</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="habilidades">Habilidades</Label>
            <Textarea id="habilidades" name="habilidades" defaultValue={user.habilidades || ""} placeholder="Separadas por comas" rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cvUrl">URL de CV</Label>
            <Input id="cvUrl" name="cvUrl" defaultValue={user.cvUrl || ""} placeholder="https://" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="materiasAprobadas">Materias aprobadas</Label>
            <Textarea id="materiasAprobadas" name="materiasAprobadas" defaultValue={user.materiasAprobadas || ""} placeholder="Lista de materias aprobadas" rows={3} />
          </div>
        </>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? "Guardando..." : "Guardar Cambios"}
      </Button>
    </form>
  )
}
