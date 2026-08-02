import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/perfil",
        "/admin",
        "/universidad",
        "/tutor-academico",
        "/tutor-empresa",
        "/chat",
        "/calendario",
        "/notificaciones",
        "/recuperar",
        "/restablecer",
        "/api/",
      ],
    },
    sitemap: "https://pasantias.softgroup.com.ar/sitemap.xml",
  }
}
