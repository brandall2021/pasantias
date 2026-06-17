"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

interface Props {
  pasantiaId: string
  yaPostulado: boolean
  userId: string
}

export function PostularButton({ pasantiaId, yaPostulado }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)

    try {
      const res = await fetch("/api/postulaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pasantiaId,
          mensaje: formData.get("mensaje"),
          cvUrl: formData.get("cvUrl"),
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Error al postular")
        setLoading(false)
        return
      }

      setSuccess(true)
      router.refresh()
    } catch {
      setError("Error de conexión")
      setLoading(false)
    }
  }

  if (yaPostulado) {
    return <Button variant="secondary" disabled>Ya te postulaste</Button>
  }

  if (success) {
    return <Button variant="success" disabled>Postulación enviada ✓</Button>
  }

  if (!showForm) {
    return <Button onClick={() => setShowForm(true)}>Postularme</Button>
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="mensaje">Mensaje para la institución</Label>
            <Textarea id="mensaje" name="mensaje" placeholder="Contá por qué te interesa esta pasantía..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cvUrl">Link a tu CV (opcional)</Label>
            <Input id="cvUrl" name="cvUrl" placeholder="https://drive.google.com/..." />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Postulación"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
