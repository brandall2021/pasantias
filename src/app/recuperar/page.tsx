"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

export default function RecuperarPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string

    try {
      const res = await fetch("/api/auth/recuperar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al enviar el email")
        setLoading(false)
        return
      }

      setSent(true)
    } catch {
      setError("Error de conexión")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Mail size={40} className="text-blue-600" />
          </div>
          <CardTitle className="text-xl">Recuperar Contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-green-600 font-medium">Email enviado</p>
              <p className="text-sm text-gray-500">
                Si el email existe en el sistema, recibirás un enlace para restablecer tu contraseña.
              </p>
              <Link href="/login" className="text-blue-600 hover:underline text-sm block">
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="tu@email.com" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar enlace de recuperación"}
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
