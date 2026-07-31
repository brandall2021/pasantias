"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface PlanTrabajo {
  id: string
  objetivos: string
  horasSemana: number
  fechaInicio: string
  fechaFin: string
  createdAt: string
}

export function PlanTrabajoForm({ convenioId, initialPlans }: { convenioId: string; initialPlans: PlanTrabajo[] }) {
  const [showForm, setShowForm] = useState(false)
  const [objetivos, setObjetivos] = useState("")
  const [horasSemana, setHorasSemana] = useState("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [saving, setSaving] = useState(false)
  const [plans, setPlans] = useState(initialPlans)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!objetivos.trim() || !horasSemana || !fechaInicio || !fechaFin) return
    setSaving(true)
    const res = await fetch("/api/planes-trabajo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ convenioId, objetivos, horasSemana: parseInt(horasSemana), fechaInicio, fechaFin }),
    })
    if (res.ok) {
      const plan = await res.json()
      setPlans([plan, ...plans])
      setObjetivos("")
      setHorasSemana("")
      setFechaInicio("")
      setFechaFin("")
      setShowForm(false)
    }
    setSaving(false)
  }

  return (
    <div>
      <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">Plan de trabajo</h4>
      {plans.length > 0 ? (
        <div className="space-y-1 mb-2">
          {plans.map((p) => (
            <div key={p.id} className="text-xs bg-gray-50 p-2 rounded">
              <p className="font-medium">{p.objetivos}</p>
              <p className="text-gray-400">{p.horasSemana}h/sem — {formatDate(p.fechaInicio)} al {formatDate(p.fechaFin)}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 mb-2">Sin plan de trabajo</p>
      )}
      {!showForm ? (
        <Button type="button" size="sm" variant="secondary" className="text-xs h-7" onClick={() => setShowForm(true)}>
          <Plus size={12} /> Crear plan
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea placeholder="Objetivos del plan..." rows={2} value={objetivos} onChange={(e) => setObjetivos(e.target.value)} className="text-xs" />
          <div className="grid grid-cols-3 gap-2">
            <Input type="number" placeholder="Horas/sem" value={horasSemana} onChange={(e) => setHorasSemana(e.target.value)} className="text-xs h-8" />
            <Input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="text-xs h-8" />
            <Input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="text-xs h-8" />
          </div>
          <div className="flex gap-1">
            <Button type="submit" size="sm" className="text-xs h-7" disabled={saving || !objetivos.trim() || !horasSemana || !fechaInicio || !fechaFin}>
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
