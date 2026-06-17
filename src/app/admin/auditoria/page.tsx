"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { formatDate } from "@/lib/utils"
import { Shield, Search } from "lucide-react"

interface AuditLog {
  id: string
  accion: string
  detalle: string
  ip: string
  createdAt: string
  usuario: { name: string; email: string; role: string }
}

const ACCIONES = [
  { value: "", label: "Todas las acciones" },
  { value: "LOGIN", label: "Inicio de sesión" },
  { value: "REGISTRO", label: "Registro" },
  { value: "POSTULAR", label: "Postulación" },
  { value: "CREAR_PASANTIA", label: "Crear pasantía" },
  { value: "BANEAR", label: "Banear/Desbanear" },
  { value: "MODIFICAR_PASANTIA", label: "Modificar pasantía" },
  { value: "ELIMINAR_USUARIO", label: "Eliminar usuario" },
]

const ACCION_COLORS: Record<string, string> = {
  LOGIN: "bg-blue-100 text-blue-800",
  REGISTRO: "bg-green-100 text-green-800",
  POSTULAR: "bg-purple-100 text-purple-800",
  CREAR_PASANTIA: "bg-teal-100 text-teal-800",
  BANEAR: "bg-red-100 text-red-800",
  MODIFICAR_PASANTIA: "bg-yellow-100 text-yellow-800",
  ELIMINAR_USUARIO: "bg-red-100 text-red-800",
}

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filtroAccion, setFiltroAccion] = useState("")
  const [busqueda, setBusqueda] = useState("")

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filtroAccion) params.set("accion", filtroAccion)
    params.set("limit", "200")

    fetch(`/api/auditoria?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setLogs(data.logs || [])
        setTotal(data.total || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filtroAccion])

  const filtrados = busqueda
    ? logs.filter((l) =>
        l.usuario.name.toLowerCase().includes(busqueda.toLowerCase()) ||
        l.usuario.email.toLowerCase().includes(busqueda.toLowerCase()) ||
        (l.detalle && l.detalle.toLowerCase().includes(busqueda.toLowerCase()))
      )
    : logs

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Shield size={28} className="text-gray-700" />
        <h1 className="text-2xl font-bold">Auditoría</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Buscar por usuario o detalle..."
            className="pl-9"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <Select value={filtroAccion} onChange={(e: any) => setFiltroAccion(e.target.value)}>
          {ACCIONES.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </Select>
      </div>

      <p className="text-sm text-gray-500 mb-4">{total} registros totales</p>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : filtrados.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500 py-12">
            <p>No hay registros de auditoría</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium pr-4">Fecha</th>
                    <th className="pb-3 font-medium pr-4">Usuario</th>
                    <th className="pb-3 font-medium pr-4">Rol</th>
                    <th className="pb-3 font-medium pr-4">Acción</th>
                    <th className="pb-3 font-medium">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((log) => (
                    <tr key={log.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 text-xs text-gray-400 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                      <td className="py-3 pr-4 font-medium whitespace-nowrap">{log.usuario.name}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          log.usuario.role === "ADMIN" ? "bg-red-100 text-red-800" :
                          log.usuario.role === "INSTITUCION" ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {log.usuario.role === "ESTUDIANTE" ? "Estudiante" :
                           log.usuario.role === "INSTITUCION" ? "Institución" : "Admin"}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${ACCION_COLORS[log.accion] || "bg-gray-100 text-gray-800"}`}>
                          {ACCIONES.find((a) => a.value === log.accion)?.label || log.accion}
                        </span>
                      </td>
                      <td className="py-3 text-gray-600 max-w-xs truncate">{log.detalle || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
