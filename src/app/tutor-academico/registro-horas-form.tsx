"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface RegistroHoras {
  id: string
  horas: number
  descripcion: string | null
  fecha: string
}

export function RegistroHorasForm({ convenioId, initialRegistros, initialTotal }: { convenioId: string; initialRegistros: RegistroHoras[]; initialTotal: number }) {
  const [showForm, setShowForm] = useState(false)
  const [horas, setHoras] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [fecha, setFecha] = useState("")
  const [saving, setSaving] = useState(false)
  const [registros, setRegistros] = useState(initialRegistros)
  const [total, setTotal] = useState(initialTotal)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!horas) return
    setSaving(true)
    const res = await fetch("/api/registro-horas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ convenioId, horas: parseInt(horas), descripcion, fecha: fecha || undefined }),
    })
    if (res.ok) {
      const registro = await res.json()
      setRegistros([registro, ...registros])
      setTotal(total + parseInt(horas))
      setHoras("")
      setDescripcion("")
      setFecha("")
      setShowForm(false)
    }
    setSaving(false)
  }

  return (
    <div>
      <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">Registro de horas</h4>
      {registros.length > 0 ? (
        <div className="space-y-1 mb-2">
          {registros.map((r) => (
            <div key={r.id} className="text-xs bg-gray-50 p-2 rounded flex justify-between">
              <div>
                <span className="text-gray-400">{formatDate(r.fecha)}:</span> {r.descripcion || "—"}
              </div>
              <span className="font-medium">{r.horas}h</span>
            </div>
          ))}
          <div className="text-xs bg-purple-50 p-2 rounded flex justify-between font-medium">
            <span>Total</span>
            <span>{total}h</span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-400 mb-2">Sin horas registradas</p>
      )}
      {!showForm ? (
        <Button type="button" size="sm" variant="secondary" className="text-xs h-7" onClick={() => setShowForm(true)}>
          <Plus size={12} /> Registrar horas
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" placeholder="Horas" value={horas} onChange={(e) => setHoras(e.target.value)} className="text-xs h-8" />
            <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="text-xs h-8" />
          </div>
          <Textarea placeholder="Descripción (opcional)..." rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="text-xs" />
          <div className="flex gap-1">
            <Button type="submit" size="sm" className="text-xs h-7" disabled={saving || !horas}>
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
