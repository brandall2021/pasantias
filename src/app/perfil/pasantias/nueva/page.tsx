"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AREAS } from "@/lib/constants"

export default function NuevaPasantiaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      const res = await fetch("/api/pasantias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Error al crear")
        setLoading(false)
        return
      }

      router.push("/perfil/pasantias")
      router.refresh()
    } catch {
      setError("Error de conexión")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Nueva Pasantía</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>}

            <div className="space-y-2">
              <Label htmlFor="titulo">Título de la pasantía</Label>
              <Input id="titulo" name="titulo" required placeholder="Ej: Pasante de Desarrollo Web" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Área</Label>
              <Select id="area" name="area" required>
                <option value="">Seleccionar área...</option>
                {AREAS.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea id="descripcion" name="descripcion" required rows={5} placeholder="Describí las tareas y objetivos de la pasantía..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requisitos">Requisitos (opcional)</Label>
              <Textarea id="requisitos" name="requisitos" rows={3} placeholder="Requisitos para los postulantes..." />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modalidad">Modalidad</Label>
                <Select id="modalidad" name="modalidad">
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="HIBRIDA">Híbrida</option>
                  <option value="REMOTA">Remota</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duracion">Duración</Label>
                <Input id="duracion" name="duracion" placeholder="Ej: 3 meses" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="becaEconomica">Beca económica ($)</Label>
                <Input id="becaEconomica" name="becaEconomica" type="number" placeholder="Ej: 50000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargaHoraria">Carga horaria</Label>
                <Input id="cargaHoraria" name="cargaHoraria" placeholder="Ej: 20 hs semanales" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vacantes">Vacantes</Label>
              <Input id="vacantes" name="vacantes" type="number" defaultValue="1" min="1" />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Publicando..." : "Publicar Pasantía"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
