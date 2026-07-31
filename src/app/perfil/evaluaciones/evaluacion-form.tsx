"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StarRating } from "@/components/ui/star-rating"

const TIPO_LABELS: Record<string, string> = {
  ALUMNO_A_EMPRESA: "Alumno → Empresa",
  EMPRESA_A_ALUMNO: "Empresa → Alumno",
  TUTOR: "Tutor",
  INTERMEDIO_ALUMNO: "Intermedia - Alumno",
  INTERMEDIO_EMPRESA: "Intermedia - Empresa",
  FINAL_ALUMNO: "Final - Alumno",
  FINAL_EMPRESA: "Final - Empresa",
}

export function EvaluacionForm({
  postulacionId,
  availableTipos,
}: {
  postulacionId: string
  availableTipos: string[]
}) {
  const [tipo, setTipo] = useState(availableTipos[0] || "")
  const [puntaje, setPuntaje] = useState(0)
  const [comentario, setComentario] = useState("")
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (puntaje === 0 || !tipo) return
    setSaving(true)
    setError("")

    const res = await fetch(`/api/postulaciones/${postulacionId}/evaluacion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, puntaje, comentario: comentario || undefined }),
    })

    if (res.ok) {
      setDone(true)
      window.location.reload()
    } else {
      const err = await res.json()
      setError(err.error || "Error al guardar")
    }
    setSaving(false)
  }

  if (done) return null
  if (availableTipos.length === 0) return null

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <label className="text-sm text-gray-600 mb-1 block">Tipo de evaluación</label>
        <select
          value={tipo}
          onChange={(e) => { setTipo(e.target.value); setPuntaje(0) }}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          {availableTipos.map((t) => (
            <option key={t} value={t}>{TIPO_LABELS[t] || t}</option>
          ))}
        </select>
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-1">Puntaje</p>
        <StarRating value={puntaje} onChange={setPuntaje} />
      </div>
      <div>
        <Textarea
          placeholder="Comentario (opcional)..."
          rows={2}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />
      </div>
      <Button type="submit" size="sm" disabled={saving || puntaje === 0 || !tipo}>
        {saving ? "Guardando..." : "Enviar evaluación"}
      </Button>
    </form>
  )
}
