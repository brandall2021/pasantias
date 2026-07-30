"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

export function SeguimientoForm({ postulacionId }: { postulacionId: string }) {
  const [showForm, setShowForm] = useState(false)
  const [descripcion, setDescripcion] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!descripcion.trim()) return
    setSaving(true)
    const res = await fetch(`/api/postulaciones/${postulacionId}/seguimiento`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descripcion }),
    })
    if (res.ok) {
      setDescripcion("")
      setShowForm(false)
      window.location.reload()
    }
    setSaving(false)
  }

  return (
    <div className="mt-2">
      {!showForm ? (
        <Button type="button" size="sm" variant="secondary" className="text-xs h-7" onClick={() => setShowForm(true)}>
          <Plus size={12} /> Agregar seguimiento
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            placeholder="Describí el progreso del alumno..."
            rows={2}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="text-xs"
          />
          <div className="flex gap-1">
            <Button type="submit" size="sm" className="text-xs h-7" disabled={saving || !descripcion.trim()}>
              {saving ? "..." : "Guardar"}
            </Button>
            <Button type="button" size="sm" variant="ghost" className="text-xs h-7" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
