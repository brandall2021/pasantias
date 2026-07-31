import { NotificacionRepository } from "@/repositories/notificacion.repository"
import { PushSubscriptionRepository } from "@/repositories/pushSubscription.repository"
import { getWebPush } from "@/lib/webpush"

export async function crearNotificacion({
  usuarioId,
  titulo,
  mensaje,
  link,
}: {
  usuarioId: string
  titulo: string
  mensaje?: string
  link?: string
}) {
  const notificacion = await NotificacionRepository.create({
    usuarioId,
    titulo,
    mensaje,
    link,
  })

  try {
    const subscriptions = await PushSubscriptionRepository.findByUsuarioId(usuarioId)

    if (subscriptions.length > 0) {
      const webpush = getWebPush()
      const payload = JSON.stringify({ titulo, mensaje, link })

      for (const sub of subscriptions) {
        webpush
          .sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload
          )
          .catch((err) => {
            if (err.statusCode === 410 || err.statusCode === 404) {
              PushSubscriptionRepository.deleteByEndpoint(sub.endpoint).catch(() => {})
            }
          })
      }
    }
  } catch {
    // push no disponible (ej. faltan VAPID keys en desarrollo)
  }

  return notificacion
}

export async function contarNoLeidas(usuarioId: string) {
  return NotificacionRepository.countNoLeidas(usuarioId)
}

export async function marcarLeida(id: string, usuarioId: string) {
  return NotificacionRepository.marcarLeida(id, usuarioId)
}

export async function marcarTodasLeidas(usuarioId: string) {
  return NotificacionRepository.marcarTodasLeidas(usuarioId)
}
