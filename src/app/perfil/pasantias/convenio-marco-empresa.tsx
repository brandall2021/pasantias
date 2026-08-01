"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { FileText, Plus, X } from "lucide-react"

interface Universidad {
  id: string
  nombre: string
}

interface ConvenioMarco {
  id: string
  universidadId: string
  universidad: { nombre: string }
  fechaInicio: string
  fechaFin: string | null
  estado: string
}

export function ConvenioMarcoEmpresa() {
  const [convenios, setConvenios] = useState<ConvenioMarco[]>([])
  const [universidades, setUniversidades] = useState<Universidad[]>([])
  const [showForm, setShowForm] = useState(false)
  const [universidadId, setUniversidadId] = useState("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/convenios-marco")
      .then((r) => r.json())
      .then(setConvenios)
      .catch(() => {})
    fetch("/api/universidades")
      .then((r) => r.json())
      .then(setUniversidades)
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!universidadId || !fechaInicio) return
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/convenios-marco", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          universidadId,
          fechaInicio,
          fechaFin: fechaFin || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Error al solicitar")
        setSaving(false)
        return
      }
      const nuevo = await res.json()
      setConvenios((prev) => [nuevo, ...prev])
      setShowForm(false)
      setUniversidadId("")
      setFechaInicio("")
      setFechaFin("")
      setSaving(false)
    } catch {
      setError("Error de conexión")
      setSaving(false)
    }
  }

  const estadoBadge = (estado: string) => {
    if (estado === "SOLICITADO") return <Badge className="bg-yellow-100 text-yellow-700">Solicitado</Badge>
    if (estado === "ACTIVO") return <Badge className="bg-green-100 text-green-700">Activo</Badge>
    return <Badge className="bg-red-100 text-red-700">Rechazado</Badge>
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
            {showForm ? "Cancelar" : "Solicitar convenio"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg space-y-3">
            <div>
              <Label>Universidad</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                value={universidadId}
                onChange={(e) => setUniversidadId(e.target.value)}
                required
              >
                <option value="">Seleccionar universidad</option>
                {universidades.map((u) => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
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
            <p className="text-xs text-gray-500">La solicitud queda pendiente de aprobación por la universidad.</p>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Enviando..." : "Solicitar convenio marco"}
            </Button>
          </form>
        )}

        {convenios.length === 0 ? (
          <p className="text-sm text-gray-500">No hay convenios marco con universidades.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium">Universidad</th>
                  <th className="pb-2 font-medium">Inicio</th>
                  <th className="pb-2 font-medium">Fin</th>
                  <th className="pb-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {convenios.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-2 font-medium">{c.universidad.nombre}</td>
                    <td className="py-2 text-xs text-gray-500">{formatDate(c.fechaInicio)}</td>
                    <td className="py-2 text-xs text-gray-500">{c.fechaFin ? formatDate(c.fechaFin) : "—"}</td>
                    <td className="py-2">{estadoBadge(c.estado)}</td>
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
