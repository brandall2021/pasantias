"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function TogglePasantiaButton({ pasantiaId, activo, titulo }: { pasantiaId: string; activo: boolean; titulo: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    if (!confirm(`¿${activo ? "Desactivar" : "Activar"} la pasantía "${titulo}"?`)) return

    setLoading(true)
    const res = await fetch(`/api/admin/pasantias/${pasantiaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !activo }),
    })

    if (res.ok) router.refresh()
    setLoading(false)
  }

  return (
    <Button
      variant={activo ? "destructive" : "secondary"}
      size="sm"
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? "..." : activo ? "Desactivar" : "Activar"}
    </Button>
  )
}
