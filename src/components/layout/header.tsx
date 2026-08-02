"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Building2, Search, MessageSquare, User, Menu, X, LogOut, Shield, Star, Bell, CalendarDays } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { useState } from "react"
import { useNoLeidas } from "@/hooks/use-no-leidas"

export function Header() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const noLeidas = useNoLeidas(!!session?.user)

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary-600">
            <Building2 size={24} />
            Gestión de Pasantías
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/pasantias" className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 transition-colors">
              <Search size={16} />
              Buscar Pasantías
            </Link>

            {session?.user ? (
              <>
                {session.user.role === "EMPRESA" && (
                  <Link href="/perfil/pasantias" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                    Mis Pasantías
                  </Link>
                )}
                {session.user.role === "ESTUDIANTE" && (
                  <Link href="/perfil/postulaciones" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                    Mis Postulaciones
                  </Link>
                )}
                <Link href="/notificaciones" className="relative flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  <Bell size={16} />
                  {noLeidas > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 font-bold">
                      {noLeidas > 99 ? "99+" : noLeidas}
                    </span>
                  )}
                </Link>
                <Link href="/perfil/evaluaciones" className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  <Star size={16} />
                  Evaluaciones
                </Link>
                <Link href="/chat" className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  <MessageSquare size={16} />
                  Chat
                </Link>
                <Link href="/calendario" className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  <CalendarDays size={16} />
                  Calendario
                </Link>
                {session.user.role === "UNIVERSIDAD" && (
                  <Link href="/universidad" className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 transition-colors">
                    <Building2 size={16} />
                    Universidad
                  </Link>
                )}
                {session.user.role === "TUTOR_ACADEMICO" && (
                  <Link href="/tutor-academico" className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 transition-colors">
                    <Building2 size={16} />
                    Tutor Académico
                  </Link>
                )}
                {session.user.role === "TUTOR_EMPRESA" && (
                  <Link href="/tutor-empresa" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors">
                    <Building2 size={16} />
                    Tutor Empresarial
                  </Link>
                )}
                {session.user.role === "ADMIN" && (
                  <Link href="/admin" className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 transition-colors">
                    <Shield size={16} />
                    Admin
                  </Link>
                )}
                <Link href="/perfil" className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 transition-colors">
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
                <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                  Iniciar Sesión
                </Link>
                <Link href="/register" className={buttonVariants({ size: "sm" })}>
                  Registrarse
                </Link>
              </>
            )}
          </nav>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div id="mobile-nav" className="md:hidden pb-4 space-y-2">
            <Link href="/pasantias" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
              Buscar Pasantías
            </Link>
            {session?.user ? (
              <>
                {session.user.role === "EMPRESA" && (
                  <Link href="/perfil/pasantias" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
                    Mis Pasantías
                  </Link>
                )}
                {session.user.role === "ESTUDIANTE" && (
                  <Link href="/perfil/postulaciones" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
                    Mis Postulaciones
                  </Link>
                )}
                <Link href="/notificaciones" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
                  Notificaciones {noLeidas > 0 && `(${noLeidas})`}
                </Link>
                <Link href="/perfil/evaluaciones" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
                  Evaluaciones
                </Link>
                <Link href="/chat" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
                  Chat
                </Link>
                <Link href="/calendario" className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
                  Calendario
                </Link>
                {session.user.role === "UNIVERSIDAD" && (
                  <Link href="/universidad" className="block px-3 py-2 text-sm text-green-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
                    Universidad
                  </Link>
                )}
                {session.user.role === "TUTOR_ACADEMICO" && (
                  <Link href="/tutor-academico" className="block px-3 py-2 text-sm text-purple-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
                    Tutor Académico
                  </Link>
                )}
                {session.user.role === "TUTOR_EMPRESA" && (
                  <Link href="/tutor-empresa" className="block px-3 py-2 text-sm text-blue-600 hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
                    Tutor Empresarial
                  </Link>
                )}
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
                <Link href="/register" className="block px-3 py-2 text-sm text-primary-600 font-medium hover:bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>
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
