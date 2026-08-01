import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AnalyticsService } from "@/services/analytics.service"
import { CheckCircle2, Clock, GraduationCap, Star, FileCheck, Percent, Briefcase } from "lucide-react"
import Link from "next/link"

export default async function ReportesPage() {
  const session = await auth()
  if (!session?.user || (session.user.role !== "UNIVERSIDAD" && session.user.role !== "ADMIN")) {
    redirect("/login")
  }

  const universidadId = (session.user as { universidadId?: string }).universidadId
  if (!universidadId) redirect("/perfil")

  let data
  try {
    data = await AnalyticsService.resumenUniversidad(universidadId)
  } catch {
    redirect("/universidad")
  }

  const { resumen, porFacultad, horasPorMes } = data
  const maxHorasMes = Math.max(1, ...horasPorMes.map(([, v]) => v))

  return (
    <DashboardLayout nombre={session.user.name ?? "Universidad"} subtitulo="Panel analítico: métricas de pasantías, horas y evaluaciones de tu universidad.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Briefcase size={20} />} label="Pasantías" value={resumen.totalPasantias} hint={`${resumen.totalFinalizadas} finalizadas`} tone="primary" />
        <StatCard icon={<Percent size={20} />} label="Tasa de finalización" value={`${resumen.tasaFinalizacion}%`} tone="success" />
        <StatCard icon={<Clock size={20} />} label="Horas registradas" value={resumen.totalHoras} hint={`avance ${resumen.avanceHoras}%`} tone="purple" />
        <StatCard icon={<Star size={20} />} label="Promedio evaluaciones" value={resumen.evaluacionPromedio} tone="warning" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><GraduationCap size={16} /> Pasantías por facultad</CardTitle></CardHeader>
          <CardContent>
            {porFacultad.length === 0 ? (
              <p className="text-sm text-gray-500">Sin datos.</p>
            ) : (
              <div className="space-y-4">
                {porFacultad.map((f) => {
                  const max = Math.max(1, ...porFacultad.map((x) => x.total))
                  const activasPct = f.total > 0 ? Math.round((f.activas / f.total) * 100) : 0
                  const finalizadasPct = f.total > 0 ? Math.round((f.finalizadas / f.total) * 100) : 0
                  return (
                    <div key={f.facultad}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{f.facultad}</span>
                        <span className="text-gray-500">{f.total} pasantías</span>
                      </div>
                      <div className="h-3 rounded-full bg-gray-100 overflow-hidden flex">
                        <div className="bg-blue-500 h-full" style={{ width: `${(f.activas / max) * 100}%` }} title={`Activas: ${f.activas}`} />
                        <div className="bg-green-500 h-full" style={{ width: `${(f.finalizadas / max) * 100}%` }} title={`Finalizadas: ${f.finalizadas}`} />
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Activas ({activasPct}%)</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Finalizadas ({finalizadasPct}%)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock size={16} /> Horas registradas por mes</CardTitle></CardHeader>
          <CardContent>
            {horasPorMes.length === 0 ? (
              <p className="text-sm text-gray-500">Aún no hay horas registradas.</p>
            ) : (
              <div className="flex items-end gap-2 h-40">
                {horasPorMes.map(([mes, horas]) => (
                  <div key={mes} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-medium text-gray-600">{horas}</span>
                    <div className="w-full bg-purple-500 rounded-t" style={{ height: `${Math.max(4, (horas / maxHorasMes) * 120)}px` }} />
                    <span className="text-[10px] text-gray-400 capitalize">{mes}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileCheck size={16} /> Convenios y compromisos</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-600" />
            <span><strong>{resumen.conveniosCompletos}</strong> de {resumen.totalConvenios} convenios completos</span>
          </div>
          <div>
            <span><strong>{resumen.totalPostulaciones}</strong> postulaciones totales</span>
          </div>
          <div className="ml-auto">
            <Link href="/universidad" className="text-primary-600 hover:underline text-sm">← Volver al dashboard</Link>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
