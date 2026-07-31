"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"

interface NotificacionesResponse {
  notificaciones: unknown[]
  noLeidas: number
}

export function useNoLeidas(enabled = true) {
  const [noLeidas, setNoLeidas] = useState(0)

  useEffect(() => {
    if (!enabled) return

    let active = true

    async function check() {
      try {
        const data = await apiFetch<NotificacionesResponse>("/api/notificaciones")
        if (active) setNoLeidas(data.noLeidas || 0)
      } catch {
        // ignore
      }
    }

    check()
    const interval = setInterval(check, 30000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [enabled])

  return noLeidas
}
