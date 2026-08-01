const bool = (v: string | undefined, fallback: boolean) =>
  v === undefined ? fallback : v === "true"

export const config = {
  databaseUrl: process.env.DATABASE_URL || "",
  authSecret: process.env.AUTH_SECRET || "",
  authUrl: process.env.AUTH_URL || "http://localhost:3000",
  nextAuthUrl: process.env.NEXTAUTH_URL || process.env.AUTH_URL || "http://localhost:3000",
  google: {
    id: process.env.AUTH_GOOGLE_ID || "",
    secret: process.env.AUTH_GOOGLE_SECRET || "",
  },
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: bool(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || "noreply@pasantias.com",
  },
  vapid: {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
    privateKey: process.env.VAPID_PRIVATE_KEY || "",
  },
  cron: {
    secret: process.env.CRON_SECRET || "",
  },
  nodeEnv: process.env.NODE_ENV || "development",
} as const

export function getAuthSecret(): string {
  if (!config.authSecret) throw new Error("AUTH_SECRET no configurado")
  return config.authSecret
}

export function getBaseUrl(): string {
  return config.nextAuthUrl
}
