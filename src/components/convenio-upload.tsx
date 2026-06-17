"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, Clock } from "lucide-react"

interface ConvenioUploadProps {
  postulacionId: string
  convenioUrl?: string | null
  parte: "estudiante" | "empresa" | "institucion"
  label: string
  disabled?: boolean
}

export function ConvenioUpload({ postulacionId, convenioUrl, parte, label, disabled }: ConvenioUploadProps) {
  const [url, setUrl] = useState(convenioUrl || "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setSaving(true)
    setError("")

    try {
      const res = await fetch(`/api/postulaciones/${postulacionId}/convenio`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parte, url: url.trim() }),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Error al guardar")
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

  if (convenioUrl) {
    return (
      <div className="text-xs">
        <div className="flex items-center gap-1 text-green-600 mb-1">
          <CheckCircle size={12} />
          <span className="font-medium">{label}: Firmado</span>
        </div>
        <a href={convenioUrl} target="_blank" className="text-blue-600 hover:underline block truncate max-w-[200px]">
          Ver documento
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-1">
      <div className="flex items-center gap-1 text-yellow-600 mb-1">
        <Clock size={12} />
        <span className="font-medium text-xs">{label}: Pendiente</span>
      </div>
      {!disabled && (
        <>
          <Input
            placeholder="Link de Google Drive..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="text-xs h-7"
            required
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Button type="submit" size="sm" disabled={saving || !url.trim()} className="text-xs h-7 px-2">
            {saving ? "..." : "Subir convenio"}
          </Button>
        </>
      )}
    </form>
  )
}
