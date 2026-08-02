"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Bell, Menu, X, Search } from "lucide-react"
import { Sidebar } from "./sidebar"
import { useNoLeidas } from "@/hooks/use-no-leidas"
import { cn } from "@/lib/utils"

function getInitials(name?: string | null) {
  if (!name) return "?"
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const noLeidas = useNoLeidas(!!session?.user)
  const user = session?.user
  const name = user?.name ?? "Usuario"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-gray-200 bg-white lg:block">
        <Sidebar role={user?.role} />
      </aside>

      {/* Sidebar móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-lift animate-slide-up">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
            >
              <X size={18} />
            </button>
            <Sidebar role={user?.role} onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
              >
                <Menu size={20} />
              </button>
              <form action="/pasantias" method="get" className="relative hidden sm:block">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="q"
                  placeholder="Buscar pasantías..."
                  className="h-9 w-56 rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition-all focus:w-72 focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                />
              </form>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/notificaciones"
                className="relative rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <Bell size={20} />
                {noLeidas > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white">
                    {noLeidas > 99 ? "99+" : noLeidas}
                  </span>
                )}
              </Link>

              <Link href="/perfil" className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-gray-100">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white",
                    "bg-primary-600"
                  )}
                >
                  {user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt={name} className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    getInitials(name)
                  )}
                </span>
                <span className="hidden text-left sm:block">
                  <span className="block text-sm font-semibold text-gray-900">{name}</span>
                  <span className="block text-[11px] capitalize text-gray-400">{user?.role?.toLowerCase().replace("_", " ")}</span>
                </span>
              </Link>
            </div>
          </div>
        </header>

        <main id="main" className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
