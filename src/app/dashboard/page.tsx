import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import {
  Briefcase,
  Building2,
  ClipboardList,
  FileSignature,
  FileText,
  GraduationCap,
  Users,
  Clock,
  Shield,
} from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import { ActivityFeed, type ActivityItem } from "@/components/shared/activity-feed"
import { Badge } from "@/components/ui/badge"

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (secs < 60) return "ahora"
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `hace ${days} d`
  return new Date(date).toLocaleDateString("es-AR", { day: "numeric", month: "short" })
}

const POSTULACION_TONE: Record<string, "primary" | "success" | "warning" | "danger" | "purple"> = {
  PENDIENTE: "warning",
  REVISADO: "primary",
  ACEPTADO: "success",
  RECHAZADO: "danger",
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  const role = session.user.role
  const nombre = session.user.name ?? "Usuario"

  const today = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })

  // ─── ESTUDIANTE ────────────────────────────────────
  if (role === "ESTUDIANTE") {
    const [postulaciones, disponibles, documentos] = await Promise.all([
      prisma.postulacion.findMany({
        where: { alumnoId: session.user.id },
        include: { pasantia: { select: { titulo: true, empresa: { select: { nombre: true } } } } },
        orderBy: { fecha: "desc" },
        take: 6,
      }),
      prisma.pasantia.count({ where: { activo: true, estado: "PUBLICADA" } }),
      prisma.documento.count({ where: { usuarioId: session.user.id } }),
    ])

    const enviadas = postulaciones.length
    const enProceso = postulaciones.filter((p) => p.estado === "PENDIENTE" || p.estado === "REVISADO").length

    const actividad: ActivityItem[] = postulaciones.map((p) => ({
      icon: <ClipboardList size={16} />,
      title: p.pasantia.titulo,
      desc: `Postulación ${p.estado.toLowerCase()} · ${p.pasantia.empresa.nombre}`,
      time: timeAgo(p.fecha),
      tone: POSTULACION_TONE[p.estado],
    }))

    return (
      <DashboardLayout nombre={nombre} subtitulo={`Hoy ${today}. Tenés ${enProceso} postulación${enProceso === 1 ? "" : "es"} en proceso.`}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={<ClipboardList size={20} />} label="Postulaciones enviadas" value={enviadas} hint="Total histórico" tone="primary" />
          <StatCard icon={<Clock size={20} />} label="En proceso" value={enProceso} hint="Pendientes o en revisión" tone="warning" />
          <StatCard icon={<Briefcase size={20} />} label="Pasantías disponibles" value={disponibles} hint="Publicadas y activas" tone="success" />
          <StatCard icon={<FileText size={20} />} label="Documentos cargados" value={documentos} hint="CV, certificados, etc." tone="purple" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionCard title="Mis postulaciones" subtitle="Estado reciente de tus postulaciones">
              <ActivityFeed items={actividad} />
            </SectionCard>
          </div>
          <div>
            <SectionCard title="Siguiente paso" subtitle="Completá tu perfil para destacar">
              <ul className="space-y-3">
                <StepItem done={documentos > 0} label="Cargar documentos" href="/perfil/documentos" />
                <StepItem done={false} label="Explorar pasantías" href="/pasantias" />
              </ul>
            </SectionCard>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // ─── EMPRESA ───────────────────────────────────────
  if (role === "EMPRESA") {
    const empresaId = (session.user as { empresaId?: string }).empresaId
    const [pasantias, postulaciones, pendientes, convenios] = await Promise.all([
      prisma.pasantia.count({ where: { empresaId, activo: true } }),
      prisma.postulacion.count({ where: { pasantia: { empresaId } } }),
      prisma.postulacion.count({ where: { pasantia: { empresaId }, estado: "PENDIENTE" } }),
      prisma.convenioMarco.count({ where: { empresaId, estado: "ACTIVO" } }),
    ])

    const recientes = await prisma.postulacion.findMany({
      where: { pasantia: { empresaId } },
      include: { alumno: { select: { name: true } }, pasantia: { select: { titulo: true } } },
      orderBy: { fecha: "desc" },
      take: 6,
    })

    const actividad: ActivityItem[] = recientes.map((p) => ({
      icon: <Users size={16} />,
      title: p.alumno.name,
      desc: `Se postuló a "${p.pasantia.titulo}"`,
      time: timeAgo(p.fecha),
      tone: POSTULACION_TONE[p.estado],
    }))

    return (
      <DashboardLayout nombre={nombre} subtitulo={`Hoy ${today}. Tenés ${pendientes} postulación${pendientes === 1 ? "" : "es"} pendiente de revisión.`}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={<Briefcase size={20} />} label="Pasantías activas" value={pasantias} tone="primary" />
          <StatCard icon={<ClipboardList size={20} />} label="Postulaciones recibidas" value={postulaciones} tone="purple" />
          <StatCard icon={<Clock size={20} />} label="Pendientes" value={pendientes} hint="Requieren revisión" tone="warning" />
          <StatCard icon={<FileSignature size={20} />} label="Convenios marco activos" value={convenios} tone="success" />
        </div>

        <div className="mt-8">
          <SectionCard title="Postulaciones recientes" subtitle="Últimas postulaciones recibidas">
            <ActivityFeed items={actividad} />
          </SectionCard>
        </div>
      </DashboardLayout>
    )
  }

  // ─── ADMIN ─────────────────────────────────────────
  if (role === "ADMIN") {
    const [stats, audit] = await Promise.all([
      Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "EMPRESA" } }),
        prisma.user.count({ where: { role: "ESTUDIANTE" } }),
        prisma.pasantia.count({ where: { activo: true } }),
        prisma.postulacion.count(),
        prisma.empresa.count({ where: { estado: "PENDIENTE" } }),
        prisma.convenio.count({ where: { estado: "COMPLETADO" } }),
      ]),
      prisma.auditLog.findMany({
        include: { usuario: { select: { name: true, role: true } } },
        orderBy: { fecha: "desc" },
        take: 6,
      }),
    ])

    const [usuarios, empresas, estudiantes, pasantiasActivas, postulaciones, empresasPendientes, convenios] = stats

    const actividad: ActivityItem[] = audit.map((log) => ({
      icon: <Shield size={16} />,
      title: log.accion.replace(/_/g, " "),
      desc: `${log.usuario.name} · ${log.detalle ?? ""}`,
      time: timeAgo(log.fecha),
      tone: "primary",
    }))

    return (
      <DashboardLayout nombre={nombre} subtitulo={`Hoy ${today}. ${empresasPendientes} empresa${empresasPendientes === 1 ? "" : "s"} esperan validación.`}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={<Users size={20} />} label="Usuarios totales" value={usuarios} hint={`${estudiantes} estudiantes · ${empresas} empresas`} tone="primary" />
          <StatCard icon={<Building2 size={20} />} label="Empresas" value={empresas} hint={`${empresasPendientes} pendientes`} tone="purple" />
          <StatCard icon={<Briefcase size={20} />} label="Pasantías activas" value={pasantiasActivas} tone="success" />
          <StatCard icon={<FileSignature size={20} />} label="Convenios completados" value={convenios} tone="warning" />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SectionCard title="Actividad reciente" subtitle="Últimas acciones en el sistema">
              <ActivityFeed items={actividad} />
            </SectionCard>
          </div>
          <div>
            <SectionCard title="Gestión rápida" subtitle="Accesos directos">
              <div className="grid grid-cols-1 gap-2">
                <QuickLink href="/admin/empresas" label="Validar empresas" value={`${empresasPendientes} pendientes`} />
                <QuickLink href="/admin/usuarios" label="Usuarios" value={`${usuarios} totales`} />
                <QuickLink href="/admin/pasantias" label="Pasantías" value={`${pasantiasActivas} activas`} />
                <QuickLink href="/admin/postulaciones" label="Postulaciones" value={`${postulaciones} totales`} />
              </div>
            </SectionCard>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // ─── UNIVERSIDAD ───────────────────────────────────
  if (role === "UNIVERSIDAD") {
    const [pasantias, postulaciones, convenios, empresas] = await Promise.all([
      prisma.pasantia.count(),
      prisma.postulacion.count(),
      prisma.convenio.count({ where: { estado: "COMPLETADO" } }),
      prisma.empresa.count(),
    ])

    const recientes = await prisma.convenio.findMany({
      where: { estado: "COMPLETADO" },
      include: { postulacion: { include: { alumno: { select: { name: true } }, pasantia: { select: { titulo: true, empresa: { select: { nombre: true } } } } } } },
      orderBy: { updatedAt: "desc" },
      take: 6,
    })

    const actividad: ActivityItem[] = recientes.map((c) => ({
      icon: <FileSignature size={16} />,
      title: `${c.postulacion.alumno.name} · ${c.postulacion.pasantia.titulo}`,
      desc: `Convenio completado en ${c.postulacion.pasantia.empresa.nombre}`,
      time: timeAgo(c.updatedAt),
      tone: "success",
    }))

    return (
      <DashboardLayout nombre={nombre} subtitulo={`Hoy ${today}. Panel de gestión de la universidad.`}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={<Briefcase size={20} />} label="Pasantías" value={pasantias} tone="primary" />
          <StatCard icon={<Users size={20} />} label="Postulaciones" value={postulaciones} tone="purple" />
          <StatCard icon={<FileSignature size={20} />} label="Convenios completados" value={convenios} tone="success" />
          <StatCard icon={<Building2 size={20} />} label="Empresas" value={empresas} tone="warning" />
        </div>

        <div className="mt-8">
          <SectionCard title="Convenios recientes" subtitle="Convenios tripartitos completados">
            <ActivityFeed items={actividad} />
          </SectionCard>
        </div>
      </DashboardLayout>
    )
  }

  // ─── TUTORES ───────────────────────────────────────
  const esAcademico = role === "TUTOR_ACADEMICO"
  const [asignadas, planes, horas] = await Promise.all([
    prisma.postulacion.count({
      where: esAcademico
        ? { tutorAcademicoId: session.user.id }
        : { tutorEmpresaId: session.user.id },
    }),
    prisma.planTrabajo.count({ where: { usuarioId: session.user.id } }),
    prisma.registroHoras.count({ where: { usuarioId: session.user.id } }),
  ])

  const recientes = await prisma.postulacion.findMany({
    where: esAcademico
      ? { tutorAcademicoId: session.user.id }
      : { tutorEmpresaId: session.user.id },
    include: { alumno: { select: { name: true } }, pasantia: { select: { titulo: true } } },
    orderBy: { fecha: "desc" },
    take: 6,
  })

  const actividad: ActivityItem[] = recientes.map((p) => ({
    icon: <GraduationCap size={16} />,
    title: p.alumno.name,
    desc: `Asignado a "${p.pasantia.titulo}"`,
    time: timeAgo(p.fecha),
    tone: "primary",
  }))

  return (
    <DashboardLayout nombre={nombre} subtitulo={`Hoy ${today}. Tenés ${asignadas} pasantía${asignadas === 1 ? "" : "s"} asignadas.`}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={<Users size={20} />} label="Pasantías asignadas" value={asignadas} tone="primary" />
        <StatCard icon={<FileText size={20} />} label="Planes de trabajo" value={planes} tone="purple" />
        <StatCard icon={<Clock size={20} />} label="Horas registradas" value={horas} hint="Registros" tone="success" />
      </div>

      <div className="mt-8">
        <SectionCard title="Pasantías asignadas" subtitle="Alumnos que tutorás">
          <ActivityFeed items={actividad} />
        </SectionCard>
      </div>
    </DashboardLayout>
  )
}

function DashboardLayout({ nombre, subtitulo, children }: { nombre: string; subtitulo: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Bienvenido, {nombre.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-gray-500">{subtitulo}</p>
      </header>
      {children}
    </div>
  )
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
      <div className="px-6 py-2">{children}</div>
    </div>
  )
}

function StepItem({ done, label, href }: { done: boolean; label: string; href: string }) {
  return (
    <li>
      <a href={href} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 transition-all hover:border-primary-300 hover:shadow-card">
        <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-success-50 text-success-600" : "bg-warning-50 text-warning-600"}`}>
          {done ? "✓" : "•"}
        </span>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </a>
    </li>
  )
}

function QuickLink({ href, label, value }: { href: string; label: string; value: string }) {
  return (
    <a href={href} className="flex items-center justify-between rounded-xl border border-gray-200 p-3 transition-all hover:border-primary-300 hover:shadow-card">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <Badge variant="secondary">{value}</Badge>
    </a>
  )
}
