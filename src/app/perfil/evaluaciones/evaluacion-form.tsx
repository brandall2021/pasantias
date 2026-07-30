"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StarRating } from "@/components/ui/star-rating"

export function EvaluacionForm({
  postulacionId,
  tipo,
}: {
  postulacionId: string
  tipo: "EMPRESA_A_ALUMNO" | "ALUMNO_A_EMPRESA" | "TUTOR"
}) {
  const [puntaje, setPuntaje] = useState(0)
  const [comentario, setComentario] = useState("")
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (puntaje === 0) return
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

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
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
      <Button type="submit" size="sm" disabled={saving || puntaje === 0}>
        {saving ? "Guardando..." : "Enviar evaluación"}
      </Button>
    </form>
  )
}
