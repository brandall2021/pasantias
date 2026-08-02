import { ImageResponse } from "next/og"

export const size = {
  width: 180,
  height: 180,
}
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          borderRadius: 36,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            background: "white",
            borderRadius: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 800,
              color: "#2563eb",
            }}
          >
            P
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
