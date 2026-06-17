"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CambiarPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    const formData = new FormData(e.currentTarget)
    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/cambiar-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al cambiar contraseña")
        setLoading(false)
        return
      }

      setMessage("Contraseña actualizada correctamente")
      e.currentTarget.reset()
    } catch {
      setError("Error de conexión")
    }
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cambiar Contraseña</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && <p className="text-sm text-green-600 bg-green-50 p-3 rounded">{message}</p>}
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>}

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Contraseña actual</Label>
            <Input id="currentPassword" name="currentPassword" type="password" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva contraseña</Label>
            <Input id="newPassword" name="newPassword" type="password" required minLength={6} placeholder="Mínimo 6 caracteres" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Repetir nueva contraseña</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Cambiar Contraseña"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
