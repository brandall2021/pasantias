"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Search,
  Briefcase,
  FileText,
  ClipboardList,
  Bell,
  CalendarDays,
  MessageSquare,
  BarChart3,
  Shield,
  Users,
  Building2,
  Star,
  GraduationCap,
  Settings,
  FileSignature,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const COMMON: NavItem[] = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/notificaciones", label: "Notificaciones", icon: Bell },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/chat", label: "Chat", icon: MessageSquare },
]

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  ADMIN: [
    { href: "/admin/usuarios", label: "Usuarios", icon: Users },
    { href: "/admin/empresas", label: "Empresas", icon: Building2 },
    { href: "/admin/pasantias", label: "Pasantías", icon: Briefcase },
    { href: "/admin/postulaciones", label: "Postulaciones", icon: ClipboardList },
    { href: "/admin/auditoria", label: "Auditoría", icon: Shield },
    { href: "/universidad/reportes", label: "Reportes", icon: BarChart3 },
  ],
  UNIVERSIDAD: [
    { href: "/universidad", label: "Panel universidad", icon: GraduationCap },
    { href: "/universidad/reportes", label: "Reportes", icon: BarChart3 },
    { href: "/pasantias", label: "Pasantías", icon: Briefcase },
  ],
  EMPRESA: [
    { href: "/perfil/pasantias", label: "Mis Pasantías", icon: Briefcase },
    { href: "/perfil/postulaciones-recibidas", label: "Postulaciones", icon: ClipboardList },
    { href: "/perfil/pasantias/convenios-marco", label: "Convenios marco", icon: FileSignature },
  ],
  TUTOR_ACADEMICO: [
    { href: "/tutor-academico", label: "Panel tutor", icon: GraduationCap },
    { href: "/tutor-academico/calendario", label: "Calendario", icon: CalendarDays },
  ],
  TUTOR_EMPRESA: [
    { href: "/tutor-empresa", label: "Panel tutor", icon: Star },
  ],
  ESTUDIANTE: [
    { href: "/pasantias", label: "Buscar Pasantías", icon: Search },
    { href: "/perfil/postulaciones", label: "Mis Postulaciones", icon: ClipboardList },
    { href: "/perfil/documentos", label: "Mis Documentos", icon: FileText },
    { href: "/perfil/evaluaciones", label: "Evaluaciones", icon: Star },
  ],
}

interface SidebarProps {
  role?: string
  onNavigate?: () => void
}

export function Sidebar({ role = "ESTUDIANTE", onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const items = [...(NAV_BY_ROLE[role] ?? []), ...COMMON]

  return (
    <div className="flex h-full flex-col">
      <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2.5 px-5 pb-6 pt-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-card">
          <Briefcase size={18} />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-gray-900">Pasantías</p>
          <p className="text-[11px] text-gray-400">Gestión de pasantías</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon size={18} className={active ? "text-primary-600" : "text-gray-400"} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <Link
          href="/perfil"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === "/perfil"
              ? "bg-primary-50 text-primary-700"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          )}
        >
          <Settings size={18} className="text-gray-400" />
          Configuración
        </Link>
        <Button
          variant="ghost"
          className="mt-1 w-full justify-start text-red-500 hover:bg-danger-50 hover:text-red-600"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}
