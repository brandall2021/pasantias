"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function ValidarEmpresaButton({
  empresaId,
  estado,
  nombre,
}: {
  empresaId: string
  estado: string
  nombre: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function cambiarEstado(nuevoEstado: string) {
    setLoading(true)
    const res = await fetch(`/api/admin/empresas/${empresaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    })
    if (res.ok) router.refresh()
    setLoading(false)
  }

  if (estado === "VALIDADA") {
    return (
      <Button size="sm" variant="secondary" className="text-xs h-7" onClick={() => cambiarEstado("PENDIENTE")} disabled={loading}>
        Revocar
      </Button>
    )
  }

  if (estado === "RECHAZADA") {
    return (
      <Button size="sm" variant="secondary" className="text-xs h-7" onClick={() => cambiarEstado("PENDIENTE")} disabled={loading}>
        Revisar
      </Button>
    )
  }

  return (
    <div className="flex gap-1">
      <Button size="sm" className="text-xs h-7" onClick={() => cambiarEstado("VALIDADA")} disabled={loading}>
        Validar
      </Button>
      <Button size="sm" variant="destructive" className="text-xs h-7" onClick={() => cambiarEstado("RECHAZADA")} disabled={loading}>
        Rechazar
      </Button>
    </div>
  )
}
