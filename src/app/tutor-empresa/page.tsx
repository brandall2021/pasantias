import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/ui/stat-card"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { formatDate } from "@/lib/utils"
import { FileText, Clock, Download, MessageSquare, FileSignature, Briefcase } from "lucide-react"
import { SeguimientoForm } from "@/app/tutor-academico/seguimiento-form"
import { PlanTrabajoForm } from "@/app/tutor-academico/plan-trabajo-form"
import { RegistroHorasForm } from "@/app/tutor-academico/registro-horas-form"
import { ConvenioUpload } from "@/components/convenio-upload"

export default async function TutorEmpresaDashboard() {
  const session = await auth()
  if (!session?.user || session.user.role !== "TUTOR_EMPRESA") redirect("/login")

  const postulaciones = await prisma.postulacion.findMany({
    where: {
      tutorEmpresaId: session.user.id,
      estado: "ACEPTADO",
    },
    include: {
      alumno: { select: { name: true, email: true, carrera: { select: { nombre: true } } } },
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

  const conveniosPendientes = postulaciones.filter((p) => !p.convenio?.firmaEmpresa)
  const activas = postulaciones.filter((p) => p.convenio?.firmaEmpresa && p.pasantia.estado === "ACTIVA")

  return (
    <DashboardLayout nombre={session.user.name ?? "Tutor empresarial"} subtitulo="Panel del tutor empresarial: seguimiento, plan de trabajo y horas de tus alumnos.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard icon={<FileSignature size={20} />} label="Convenios por firmar" value={conveniosPendientes.length} tone="warning" />
        <StatCard icon={<Briefcase size={20} />} label="Pasantías activas" value={activas.length} tone="success" />
      </div>

      {conveniosPendientes.length > 0 && (
        <Card className="mb-6 border-yellow-200">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock size={16} /> Convenios por firmar</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {conveniosPendientes.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{p.alumno.name}</p>
                    <p className="text-xs text-gray-500">{p.pasantia.titulo}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {p.convenio && (
                      <a
                        href={`/api/pdf/convenio?postulacionId=${p.id}`}
                        target="_blank"
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Download size={12} /> PDF
                      </a>
                    )}
                    {p.convenio && (
                      <ConvenioUpload postulacionId={p.id} firmado={p.convenio.firmaEmpresa} parte="empresa" label="Firmar" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {postulaciones.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12 text-gray-500">
            <p>No tenés pasantías asignadas como tutor empresarial.</p>
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
                        <Badge variant="secondary">{p.pasantia.area}</Badge>
                        {p.alumno.carrera && <span className="text-xs text-gray-400">{p.alumno.carrera.nombre}</span>}
                      </CardTitle>
                      <p className="text-sm text-gray-500">{p.pasantia.titulo} — {p.pasantia.empresa.nombre}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {p.convenio && (
                        <a
                          href={`/api/pdf/convenio?postulacionId=${p.id}`}
                          target="_blank"
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Download size={12} /> Convenio PDF
                        </a>
                      )}
                      <Link href="/chat" className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1">
                        <MessageSquare size={12} /> Chat
                      </Link>
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
