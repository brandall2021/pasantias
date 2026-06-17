"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock } from "lucide-react"

interface ConvenioUploadProps {
  postulacionId: string
  firmado?: boolean
  parte: "alumno" | "empresa" | "universidad"
  label: string
  disabled?: boolean
}

export function ConvenioUpload({ postulacionId, firmado, parte, label, disabled }: ConvenioUploadProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleFirmar() {
    setSaving(true)
    setError("")

    try {
      const res = await fetch(`/api/postulaciones/${postulacionId}/convenio`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parte }),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Error al firmar")
        setSaving(false)
        return
      }

      setSaving(false)
      window.location.reload()
    } catch {
      setError("Error de conexión")
      setSaving(false)
    }
  }

  if (firmado) {
    return (
      <div className="text-xs">
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle size={12} />
          <span className="font-medium">{label}: Firmado</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 text-yellow-600">
        <Clock size={12} />
        <span className="font-medium text-xs">{label}: Pendiente</span>
      </div>
      {!disabled && (
        <>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Button type="button" size="sm" disabled={saving} onClick={handleFirmar} className="text-xs h-7 px-2">
            {saving ? "..." : "Firmar convenio"}
          </Button>
        </>
      )}
    </div>
  )
}
