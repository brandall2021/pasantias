"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { AREAS, ESTADOS_PASANTIA } from "@/lib/constants"
import { CheckCircle, Send, XCircle, ChevronRight, ArrowLeftCircle } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Pasantia {
  id: string
  titulo: string
  descripcion: string
  requisitos: string | null
  area: string
  modalidad: string
  duracion: string | null
  becaEconomica: string | null
  cargaHoraria: string | null
  vacantes: number
  estado: string
  activo: boolean
}

const NEXT_STATES: Record<string, { label: string; icon: LucideIcon; variant?: string; estado: string }[]> = {
  BORRADOR: [{ label: "Publicar pasantía", icon: Send, estado: "PUBLICADA" }],
  PUBLICADA: [{ label: "Iniciar selección", icon: ChevronRight, estado: "SELECCION" }],
  SELECCION: [{ label: "Esperar convenio", icon: ChevronRight, estado: "ESPERA_CONVENIO" }],
  ESPERA_CONVENIO: [{ label: "Activar pasantía", icon: CheckCircle, estado: "ACTIVA" }],
  ACTIVA: [{ label: "Finalizar", icon: CheckCircle, estado: "FINALIZADA" }],
  CANCELADA: [{ label: "Reabrir borrador", icon: ArrowLeftCircle, estado: "BORRADOR" }],
}

export default function EditarPasantiaPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [pasantia, setPasantia] = useState<Pasantia | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch(`/api/pasantias/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("404")
        return r.json()
      })
      .then((data) => {
        setPasantia(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        setError("No se encontró la pasantía")
      })
  }, [id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      const res = await fetch(`/api/pasantias/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Error al guardar")
        setSaving(false)
        return
      }

      setSuccess(true)
      setSaving(false)
      setTimeout(() => router.push("/perfil/pasantias"), 1500)
    } catch {
      setError("Error de conexión")
      setSaving(false)
    }
  }

  async function cambiarEstado(nuevoEstado: string) {
    setTransitioning(true)
    setError("")
    const res = await fetch(`/api/pasantias/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    })
    if (res.ok) {
      router.refresh()
    } else {
      const err = await res.json()
      setError(err.error || "Error al cambiar estado")
    }
    setTransitioning(false)
  }

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8 text-gray-500">Cargando...</div>

  if (error && !pasantia) return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/perfil/pasantias")}>Volver a mis pasantías</Button>
        </CardContent>
      </Card>
    </div>
  )

  const estadoInfo = ESTADOS_PASANTIA[pasantia!.estado] || { label: pasantia!.estado, color: "" }
  const acciones = NEXT_STATES[pasantia!.estado] || []

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Editar Pasantía</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${estadoInfo.color}`}>{estadoInfo.label}</span>
      </div>

      {acciones.length > 0 && (
        <Card className="mb-4 border-blue-200 bg-blue-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {acciones.map((accion) => {
                const Icon = accion.icon
                return (
                  <Button
                    key={accion.estado}
                    type="button"
                    size="sm"
                    onClick={() => cambiarEstado(accion.estado)}
                    disabled={transitioning}
                  >
                    {transitioning ? "..." : <><Icon size={16} /> {accion.label}</>}
                  </Button>
                )
              })}
              {pasantia!.estado !== "CANCELADA" && pasantia!.estado !== "FINALIZADA" && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => cambiarEstado("CANCELADA")}
                  disabled={transitioning}
                >
                  {transitioning ? "..." : <><XCircle size={16} /> Cancelar</>}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded mb-4">{error}</p>}

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {success && <p className="text-sm text-green-600 bg-green-50 p-3 rounded">Guardado correctamente. Redirigiendo...</p>}

            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input id="titulo" name="titulo" required defaultValue={pasantia!.titulo} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Área</Label>
              <Select id="area" name="area" required defaultValue={pasantia!.area}>
                {AREAS.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea id="descripcion" name="descripcion" required rows={5} defaultValue={pasantia!.descripcion} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requisitos">Requisitos (opcional)</Label>
              <Textarea id="requisitos" name="requisitos" rows={3} defaultValue={pasantia!.requisitos || ""} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modalidad">Modalidad</Label>
                <Select id="modalidad" name="modalidad" defaultValue={pasantia!.modalidad}>
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="HIBRIDA">Híbrida</option>
                  <option value="REMOTA">Remota</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duracion">Duración</Label>
                <Input id="duracion" name="duracion" defaultValue={pasantia!.duracion || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="becaEconomica">Beca económica ($)</Label>
                <Input id="becaEconomica" name="becaEconomica" type="number" defaultValue={pasantia!.becaEconomica || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargaHoraria">Carga horaria</Label>
                <Input id="cargaHoraria" name="cargaHoraria" defaultValue={pasantia!.cargaHoraria || ""} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vacantes">Vacantes</Label>
              <Input id="vacantes" name="vacantes" type="number" defaultValue={pasantia!.vacantes} min="1" />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.push("/perfil/pasantias")}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
