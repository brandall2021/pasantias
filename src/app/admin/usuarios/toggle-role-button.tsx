"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function ToggleRoleButton({
  userId,
  currentRole,
  userName,
  targetRole,
  label,
}: {
  userId: string
  currentRole: string
  userName: string
  targetRole: string
  label: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    if (!confirm(`¿Cambiar rol de ${userName} a "${targetRole}"?`)) return
    if (currentRole === targetRole) {
      if (!confirm(`Ya es ${targetRole}. ¿Igual actualizar?`)) return
    }

    setLoading(true)
    const res = await fetch(`/api/admin/usuarios/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: targetRole }),
    })

    if (res.ok) {
      router.refresh()
    }
    setLoading(false)
  }

  if (currentRole === targetRole) return null

  return (
    <Button variant="outline" size="sm" onClick={handleToggle} disabled={loading} className="w-full">
      {loading ? "..." : label}
    </Button>
  )
}
