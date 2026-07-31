"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldPlus } from "lucide-react"

interface SeguroFormProps {
  postulacionId: string
}

export function SeguroForm({ postulacionId }: SeguroFormProps) {
  const [open, setOpen] = useState(false)
  const [compania, setCompania] = useState("")
  const [poliza, setPoliza] = useState("")
  const [coberturaDesde, setCoberturaDesde] = useState("")
  const [coberturaHasta, setCoberturaHasta] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!compania || !poliza || !coberturaDesde || !coberturaHasta) return
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/seguros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postulacionId, compania, poliza, coberturaDesde, coberturaHasta }),
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Error al guardar")
        setSaving(false)
        return
      }
      setSaving(false)
      setOpen(false)
      window.location.reload()
    } catch {
      setError("Error de conexión")
      setSaving(false)
    }
  }

  return (
    <div>
      <Button type="button" size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => setOpen(!open)}>
        <ShieldPlus size={12} />
        {open ? "Cerrar" : "Seguro"}
      </Button>
      {open && (
        <form onSubmit={handleSubmit} className="mt-2 p-3 border rounded-lg space-y-2 bg-white min-w-[220px]">
          <div>
            <Label className="text-xs">Compañía</Label>
            <Input className="h-8 text-xs" value={compania} onChange={(e) => setCompania(e.target.value)} required />
          </div>
          <div>
            <Label className="text-xs">Póliza</Label>
            <Input className="h-8 text-xs" value={poliza} onChange={(e) => setPoliza(e.target.value)} required />
          </div>
          <div>
            <Label className="text-xs">Cobertura desde</Label>
            <Input className="h-8 text-xs" type="date" value={coberturaDesde} onChange={(e) => setCoberturaDesde(e.target.value)} required />
          </div>
          <div>
            <Label className="text-xs">Cobertura hasta</Label>
            <Input className="h-8 text-xs" type="date" value={coberturaHasta} onChange={(e) => setCoberturaHasta(e.target.value)} required />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <Button type="submit" size="sm" disabled={saving} className="text-xs h-7 w-full">
            {saving ? "..." : "Guardar seguro"}
          </Button>
        </form>
      )}
    </div>
  )
}
