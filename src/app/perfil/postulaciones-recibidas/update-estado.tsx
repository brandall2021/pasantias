"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function UpdatePostulacionEstado({ postulacionId, estado }: { postulacionId: string; estado: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function updateEstado(nuevoEstado: string) {
    setLoading(true)
    await fetch(`/api/postulaciones`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: postulacionId, estado: nuevoEstado }),
    })
    setLoading(false)
    router.refresh()
  }

  if (estado === "RECHAZADO" || estado === "ACEPTADO") return null

  return (
    <div className="flex gap-1">
      {estado === "PENDIENTE" && (
        <Button size="sm" variant="secondary" className="text-xs h-7 px-2" onClick={() => updateEstado("REVISADO")} disabled={loading}>
          Revisar
        </Button>
      )}
      {estado === "REVISADO" && (
        <>
          <Button size="sm" className="text-xs h-7 px-2" onClick={() => updateEstado("ACEPTADO")} disabled={loading}>
            Aceptar
          </Button>
          <Button size="sm" variant="destructive" className="text-xs h-7 px-2" onClick={() => updateEstado("RECHAZADO")} disabled={loading}>
            Rechazar
          </Button>
        </>
      )}
    </div>
  )
}
