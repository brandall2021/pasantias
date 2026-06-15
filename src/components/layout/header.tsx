"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Building2, Search, MessageSquare, User, Menu, X, LogOut, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function Header() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <Building2 size={24} />
            Gestión de Pasantías
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/pasantias" className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors">
              <Search size={16} />
              Buscar Pasantías
            </Link>

            {session?.user ? (
              <>
                {session.user.role === "INSTITUCION" && (
                  <Link href="/perfil/pasantias" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    Mis Pasantías
                  </Link>
                )}
                {session.user.role === "ESTUDIANTE" && (
                  <Link href="/perfil/postulaciones" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    Mis Postulaciones
                  </Link>
                )}
                <Link href="/chat" className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  <MessageSquare size={16} />
                  Chat
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link href="/admin" className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 transition-colors">
                    <Shield size={16} />
                    Admin
                  </Link>
                )}
                <Link href="/perfil" className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  <User size={16} />
                  {session.user.name}
                </Link>
                <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut size={16} />
                  Salir
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Iniciar Sesión</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Registrarse</Button>
                </Link>
              </>
            )}
          </nav>

          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/pasantias" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
              Buscar Pasantías
            </Link>
            {session?.user ? (
              <>
                {session.user.role === "INSTITUCION" && (
                  <Link href="/perfil/pasantias" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
                    Mis Pasantías
                  </Link>
                )}
                {session.user.role === "ESTUDIANTE" && (
                  <Link href="/perfil/postulaciones" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
                    Mis Postulaciones
                  </Link>
                )}
                <Link href="/chat" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
                  Chat
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link href="/admin" className="block px-3 py-2 text-sm text-orange-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <Link href="/perfil" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
                  Perfil
                </Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50 rounded">
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
                  Iniciar Sesión
                </Link>
                <Link href="/register" className="block px-3 py-2 text-sm text-blue-600 font-medium hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
                  Registrarse
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
