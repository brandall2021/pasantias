"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"
import Link from "next/link"

export default function RestablecerPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirm = formData.get("confirm") as string

    if (password !== confirm) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/restablecer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al restablecer")
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push("/login"), 2000)
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
            <Lock size={40} className="text-blue-600" />
          </div>
          <CardTitle className="text-xl">Nueva Contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <p className="text-green-600 font-medium">Contraseña actualizada</p>
              <p className="text-sm text-gray-500">Redirigiendo al inicio de sesión...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>}
              <div className="space-y-2">
                <Label htmlFor="password">Nueva contraseña</Label>
                <Input id="password" name="password" type="password" required minLength={6} placeholder="Mínimo 6 caracteres" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Repetir contraseña</Label>
                <Input id="confirm" name="confirm" type="password" required minLength={6} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Guardando..." : "Restablecer contraseña"}
              </Button>
              <p className="text-center text-sm text-gray-500">
                <Link href="/login" className="text-blue-600 hover:underline">Volver al inicio de sesión</Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
