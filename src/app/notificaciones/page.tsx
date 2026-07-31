"use client"

import { useRouter } from "next/navigation"
import { Bell, CheckCheck, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { PushSubscription } from "@/components/ui/push-subscription"
import { useFetch } from "@/hooks/use-fetch"
import { apiPatch } from "@/lib/api"
import type { Notificacion } from "@/types/api"

interface NotificacionesResponse {
  notificaciones: Notificacion[]
  noLeidas: number
}

export default function NotificacionesPage() {
  const { data, loading, reload } = useFetch<NotificacionesResponse>("/api/notificaciones")
  const router = useRouter()

  const notificaciones = data?.notificaciones || []
  const noLeidas = data?.noLeidas || 0

  async function marcarTodas() {
    try {
      await apiPatch("/api/notificaciones", { marcarTodas: true })
      reload()
    } catch {
      // ignore
    }
  }

  async function marcarUna(id: string, link?: string | null) {
    try {
      await apiPatch("/api/notificaciones", { id })
    } catch {
      // si falla la marcación no bloqueamos la navegación
    }
    if (link) router.push(link)
    else reload()
  }

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8 text-gray-500">Cargando...</div>

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell size={24} className="text-gray-700" />
          <h1 className="text-2xl font-bold">Notificaciones</h1>
          {noLeidas > 0 && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">{noLeidas} sin leer</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <PushSubscription />
          {noLeidas > 0 && (
            <Button size="sm" variant="secondary" onClick={marcarTodas}>
              <CheckCheck size={14} /> Marcar todas leídas
            </Button>
          )}
        </div>
      </div>

      {notificaciones.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12 text-gray-500">
            <Bell size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No tenés notificaciones</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notificaciones.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
                !n.leida ? "bg-blue-50 border-blue-200" : "bg-white"
              }`}
              onClick={() => marcarUna(n.id, n.link)}
            >
              <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${!n.leida ? "bg-blue-500" : "bg-transparent"}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.leida ? "font-semibold" : ""}`}>{n.titulo}</p>
                {n.mensaje && <p className="text-xs text-gray-500 mt-0.5">{n.mensaje}</p>}
                <p className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
              </div>
              {n.link && <ExternalLink size={14} className="text-gray-400 flex-shrink-0 mt-1" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
