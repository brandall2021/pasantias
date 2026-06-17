"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2 } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState("ESTUDIANTE")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role,
      institucionNombre: formData.get("institucionNombre") as string,
      dni: formData.get("dni") as string,
      fechaNacimiento: formData.get("fechaNacimiento") as string,
      direccion: formData.get("direccion") as string,
      asisteA: formData.get("asisteA") as string,
      legajo: formData.get("legajo") as string,
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Error al registrar")
        setLoading(false)
        return
      }

      router.push("/login?registered=true")
    } catch {
      setError("Error de conexión")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 size={40} className="text-blue-600" />
          </div>
          <CardTitle className="text-xl">Crear Cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input id="name" name="name" type="text" required placeholder="Juan Pérez" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="tu@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required placeholder="Mínimo 6 caracteres" minLength={6} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Tipo de cuenta</Label>
              <select
                id="role"
                name="role"
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="ESTUDIANTE">Estudiante</option>
                <option value="INSTITUCION">Institución</option>
              </select>
            </div>
            {role === "INSTITUCION" && (
              <div className="space-y-2">
                <Label htmlFor="institucionNombre">Nombre de la institución</Label>
                <Input id="institucionNombre" name="institucionNombre" type="text" required placeholder="Universidad, empresa, etc." />
              </div>
            )}

            {role === "ESTUDIANTE" && (
              <>
                <div className="border-t pt-4 mt-2">
                  <p className="text-sm font-medium text-gray-500 mb-3">Información adicional</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dni">DNI / Pasaporte</Label>
                  <Input id="dni" name="dni" type="text" placeholder="Número de documento" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
                  <Input id="fechaNacimiento" name="fechaNacimiento" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección de residencia</Label>
                  <Input id="direccion" name="direccion" type="text" placeholder="Ciudad, calle y código postal" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="asisteA">Institución a la que asiste</Label>
                  <Input id="asisteA" name="asisteA" type="text" placeholder="Universidad, escuela, etc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legajo">Legajo</Label>
                  <Input id="legajo" name="legajo" type="text" placeholder="Número de legajo o matrícula" />
                </div>
              </>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registrando..." : "Crear Cuenta"}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">Iniciar sesión</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
