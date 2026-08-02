import type { Metadata } from "next"
import { SessionProvider } from "next-auth/react"
import { auth } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AppShell } from "@/components/layout/app-shell"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://pasantias.softgroup.com.ar"),
  title: {
    default: "Gestión de Pasantías",
    template: "%s | Gestión de Pasantías",
  },
  description:
    "Plataforma de gestión de pasantías para estudiantes, universidades y empresas. Buscá oportunidades, postulate y firmá tu convenio.",
  applicationName: "Gestión de Pasantías",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Gestión de Pasantías",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()

  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:left-4 focus:top-4 focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold focus:text-gray-900 focus:shadow-lift"
        >
          Saltar al contenido
        </a>
        <SessionProvider session={session}>
          {session?.user ? (
            <AppShell>{children}</AppShell>
          ) : (
            <>
              <Header />
              <main id="main" className="flex-1">
                {children}
              </main>
              <Footer />
            </>
          )}
        </SessionProvider>
      </body>
    </html>
  )
}
