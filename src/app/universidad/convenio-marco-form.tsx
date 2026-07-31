"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { FileText, Plus, X } from "lucide-react"

interface Empresa {
  id: string
  nombre: string
}

interface ConvenioMarco {
  id: string
  empresaId: string
  empresa: { nombre: string }
  fechaInicio: string
  fechaFin: string | null
  estado: string
}

export function ConvenioMarcoList() {
  const [convenios, setConvenios] = useState<ConvenioMarco[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [showForm, setShowForm] = useState(false)
  const [empresaId, setEmpresaId] = useState("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/convenios-marco")
      .then((r) => r.json())
      .then(setConvenios)
      .catch(() => {})
    fetch("/api/empresas")
      .then((r) => r.json())
      .then(setEmpresas)
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!empresaId || !fechaInicio) return
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/convenios-marco", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empresaId, fechaInicio, fechaFin: fechaFin || undefined }),
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Error al crear")
        setSaving(false)
        return
      }
      const nuevo = await res.json()
      setConvenios((prev) => [nuevo, ...prev])
      setShowForm(false)
      setEmpresaId("")
      setFechaInicio("")
      setFechaFin("")
      setSaving(false)
    } catch {
      setError("Error de conexión")
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText size={16} /> Convenios Marco
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? "Cancelar" : "Nuevo convenio"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg space-y-3">
            <div>
              <Label>Empresa</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                value={empresaId}
                onChange={(e) => setEmpresaId(e.target.value)}
                required
              >
                <option value="">Seleccionar empresa</option>
                {empresas.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Fecha de inicio</Label>
              <Input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
            </div>
            <div>
              <Label>Fecha de fin (opcional)</Label>
              <Input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Guardando..." : "Crear convenio marco"}
            </Button>
          </form>
        )}

        {convenios.length === 0 ? (
          <p className="text-sm text-gray-500">No hay convenios marco.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium">Empresa</th>
                  <th className="pb-2 font-medium">Inicio</th>
                  <th className="pb-2 font-medium">Fin</th>
                  <th className="pb-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {convenios.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-2 font-medium">{c.empresa.nombre}</td>
                    <td className="py-2 text-xs text-gray-500">{formatDate(c.fechaInicio)}</td>
                    <td className="py-2 text-xs text-gray-500">{c.fechaFin ? formatDate(c.fechaFin) : "—"}</td>
                    <td className="py-2"><Badge>{c.estado}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
