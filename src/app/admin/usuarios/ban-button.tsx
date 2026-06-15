"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function BanUserButton({ userId, baneado, userName }: { userId: string; baneado: boolean; userName: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleBan() {
    if (!confirm(`¿Estás seguro de ${baneado ? "desbanear" : "banear"} a ${userName}?`)) return

    setLoading(true)
    const res = await fetch(`/api/admin/usuarios/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ baneado: !baneado }),
    })

    if (res.ok) {
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Button
      variant={baneado ? "secondary" : "destructive"}
      size="sm"
      onClick={handleBan}
      disabled={loading}
    >
      {loading ? "..." : baneado ? "Desbanear" : "Banear"}
    </Button>
  )
}
