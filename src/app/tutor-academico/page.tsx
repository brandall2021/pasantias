import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/ui/stat-card"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { formatDate } from "@/lib/utils"
import { getAreaLabel } from "@/lib/constants"
import { FileText, Clock, Download, FileSignature, Briefcase, CheckCircle2 } from "lucide-react"
import { SeguimientoForm } from "./seguimiento-form"
import { PlanTrabajoForm } from "./plan-trabajo-form"
import { RegistroHorasForm } from "./registro-horas-form"

export default async function TutorAcademicoDashboard() {
  const session = await auth()
  if (!session?.user || session.user.role !== "TUTOR_ACADEMICO") redirect("/login")

  const postulaciones = await prisma.postulacion.findMany({
    where: {
      estado: "ACEPTADO",
      pasantia: { estado: { in: ["ACTIVA", "ESPERA_CONVENIO"] } },
    },
    include: {
      alumno: { select: { name: true, email: true, carrera: { select: { nombre: true, facultad: { select: { nombre: true, universidad: { select: { nombre: true } } } } } } } },
      pasantia: { select: { titulo: true, area: true, estado: true, empresa: { select: { nombre: true } } } },
      convenio: {
        include: {
          seguimientos: { orderBy: { fecha: "desc" }, take: 5 },
          planesTrabajo: { orderBy: { createdAt: "desc" } },
          registroHoras: { orderBy: { fecha: "desc" } },
        },
      },
    },
    orderBy: { fecha: "desc" },
  })

  const conveniosPendientes = postulaciones.filter((p) => !p.convenio?.firmaUniversidad)
  const activas = postulaciones.filter((p) => p.convenio?.firmaUniversidad && p.pasantia.estado === "ACTIVA")
  const finalizadas = await prisma.postulacion.findMany({
    where: { pasantia: { estado: "FINALIZADA" } },
    include: {
      alumno: { select: { name: true } },
      pasantia: { select: { titulo: true, empresa: { select: { nombre: true } } } },
    },
    take: 20,
    orderBy: { fecha: "desc" },
  })

  return (
    <DashboardLayout nombre={session.user.name ?? "Tutor académico"} subtitulo="Panel del tutor académico: seguimiento, planes de trabajo y registro de horas.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={<FileSignature size={20} />} label="Convenios por firmar" value={conveniosPendientes.length} tone="warning" />
        <StatCard icon={<Briefcase size={20} />} label="Pasantías activas" value={activas.length} tone="success" />
        <StatCard icon={<CheckCircle2 size={20} />} label="Finalizadas" value={finalizadas.length} tone="primary" />
      </div>

      {conveniosPendientes.length > 0 && (
        <Card className="mb-6 border-yellow-200">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock size={16} /> Convenios por firmar</CardTitle></CardHeader>
          <CardContent>
            {conveniosPendientes.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{p.alumno.name}</p>
                  <p className="text-xs text-gray-500">{p.pasantia.titulo} — {p.pasantia.empresa.nombre}</p>
                </div>
                <div className="flex items-center gap-2">
                  {p.alumno.carrera && (
                    <span className="text-xs text-gray-400">{p.alumno.carrera.facultad.universidad.nombre}</span>
                  )}
                  {p.convenio && (
                    <a
                      href={`/api/pdf/convenio?postulacionId=${p.id}`}
                      target="_blank"
                      className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
                    >
                      <Download size={12} /> PDF
                    </a>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {postulaciones.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12 text-gray-500">
            <p>No tenés pasantías activas asignadas.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {postulaciones.map((p) => {
            const totalHoras = p.convenio?.registroHoras.reduce((sum, r) => sum + r.horas, 0) ?? 0
            return (
              <Card key={p.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <span>{p.alumno.name}</span>
                        <Badge variant="secondary">{getAreaLabel(p.pasantia.area)}</Badge>
                      </CardTitle>
                      <p className="text-sm text-gray-500">{p.pasantia.titulo} — {p.pasantia.empresa.nombre}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.convenio && (
                        <a
                          href={`/api/pdf/convenio?postulacionId=${p.id}`}
                          target="_blank"
                          className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
                        >
                          <Download size={12} /> Convenio PDF
                        </a>
                      )}
                      <Badge>{p.pasantia.estado}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1"><FileText size={12} /> Seguimiento</h4>
                      {p.convenio?.seguimientos && p.convenio.seguimientos.length > 0 ? (
                        <div className="space-y-1">
                          {p.convenio.seguimientos.map((s) => (
                            <div key={s.id} className="text-xs bg-gray-50 p-2 rounded">
                              <span className="text-gray-400">{formatDate(s.fecha)}:</span> {s.descripcion}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">Sin seguimientos registrados</p>
                      )}
                      {p.convenio && (
                        <SeguimientoForm postulacionId={p.id} />
                      )}
                    </div>
                    <div>
                      {p.convenio && (
                        <PlanTrabajoForm
                          convenioId={p.convenio.id}
                          initialPlans={p.convenio.planesTrabajo.map((pt) => ({
                            ...pt,
                            fechaInicio: pt.fechaInicio.toISOString(),
                            fechaFin: pt.fechaFin.toISOString(),
                            createdAt: pt.createdAt.toISOString(),
                          }))}
                        />
                      )}
                    </div>
                    <div>
                      {p.convenio && (
                        <RegistroHorasForm
                          convenioId={p.convenio.id}
                          initialRegistros={p.convenio.registroHoras.map((rh) => ({
                            ...rh,
                            fecha: rh.fecha.toISOString(),
                          }))}
                          initialTotal={totalHoras}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
