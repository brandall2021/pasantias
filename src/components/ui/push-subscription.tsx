"use client"

import { useEffect, useState } from "react"
import { BellRing, BellOff } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PushSubscription() {
  const [supported] = useState(() => "serviceWorker" in navigator && "PushManager" in window)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!supported) return
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setSubscribed(!!sub)
      })
    })
  }, [supported])

  async function subscribe() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.register("/sw.js")
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })

      await fetch("/api/notificaciones/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: { p256dh: arrayBufferToBase64(sub.getKey("p256dh")!), auth: arrayBufferToBase64(sub.getKey("auth")!) },
          userAgent: navigator.userAgent,
        }),
      })

      setSubscribed(true)
    } catch (e) {
      console.error("Error al suscribir push:", e)
    } finally {
      setLoading(false)
    }
  }

  async function unsubscribe() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        const endpoint = sub.endpoint
        await sub.unsubscribe()
        await fetch("/api/notificaciones/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint }),
        })
      }
      setSubscribed(false)
    } catch (e) {
      console.error("Error al desuscribir push:", e)
    } finally {
      setLoading(false)
    }
  }

  if (!supported) return null

  return (
    <Button
      variant={subscribed ? "secondary" : "primary"}
      size="sm"
      onClick={subscribed ? unsubscribe : subscribe}
      disabled={loading}
    >
      {subscribed ? <BellOff size={14} /> : <BellRing size={14} />}
      {subscribed ? "Desactivar push" : "Activar notificaciones push"}
    </Button>
  )
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  return Uint8Array.from(rawData.split("").map((c) => c.charCodeAt(0)))
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}
