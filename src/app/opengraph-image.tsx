import { ImageResponse } from "next/og"

export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"
export const alt = "Gestión de Pasantías — Conectamos estudiantes con empresas"

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 60%, #1e3a8a 100%)",
          padding: 72,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            background: "white",
            borderRadius: 28,
            width: 112,
            height: 112,
            justifyContent: "center",
          }}
        >
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <path
              d="M32 14a8 8 0 0 1 8 8v1.5a9.5 9.5 0 0 1 5 2.02l-2.9 2.9a6.5 6.5 0 0 0-4.45-1.8H29.7a6.5 6.5 0 0 0-4.45 1.8l-2.9-2.9a9.5 9.5 0 0 1 5-2.02V22a8 8 0 0 1 4.65-7.31A8 8 0 0 1 32 14Zm-8 16h16a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-.3l-1.1 12.1a2 2 0 0 1-2 1.9h-9.2a2 2 0 0 1-2-1.9L24.3 37H24a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Zm3 4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2Zm10 0a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2Z"
              fill="#2563eb"
            />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "white",
              lineHeight: 1.1,
            }}
          >
            Gestión de Pasantías
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 32,
              color: "#bfdbfe",
            }}
          >
            Conectamos estudiantes con empresas para impulsar su desarrollo profesional
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
