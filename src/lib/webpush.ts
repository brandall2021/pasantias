import webpush from "web-push"
import { config } from "@/lib/config"

export function getVapidKeys() {
  const publicKey = config.vapid.publicKey
  const privateKey = config.vapid.privateKey

  if (!publicKey || !privateKey) {
    throw new Error(
      "Faltan VAPID keys. Generalas con: npx web-push generate-vapid-keys"
    )
  }

  return { publicKey, privateKey }
}

export function getWebPush() {
  const { publicKey, privateKey } = getVapidKeys()

  webpush.setVapidDetails(
    `mailto:${config.smtp.from}`,
    publicKey,
    privateKey
  )

  return webpush
}
