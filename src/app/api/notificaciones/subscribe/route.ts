import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { PushSubscriptionRepository } from "@/repositories/pushSubscription.repository"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { endpoint, keys, userAgent } = await req.json()
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "Faltan datos de suscripción" }, { status: 400 })
  }

  const existing = await PushSubscriptionRepository.findByEndpoint(endpoint)

  if (existing) {
    const sub = await PushSubscriptionRepository.update(endpoint, {
      p256dh: keys.p256dh,
      auth: keys.auth,
      userAgent,
      usuarioId: session.user.id,
    })
    return NextResponse.json(sub)
  }

  const sub = await PushSubscriptionRepository.create({
    endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth,
    userAgent,
    usuarioId: session.user.id,
  })

  return NextResponse.json(sub, { status: 201 })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { endpoint } = await req.json()
  if (!endpoint) return NextResponse.json({ error: "Falta endpoint" }, { status: 400 })

  await PushSubscriptionRepository.deleteByEndpointYUsuario(endpoint, session.user.id)

  return NextResponse.json({ success: true })
}
