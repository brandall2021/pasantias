import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { StatCard } from "@/components/ui/stat-card"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { formatDate } from "@/lib/utils"
import { ConvenioUpload } from "@/components/convenio-upload"
import { ConvenioMarcoList } from "./convenio-marco-form"
import { SeguroForm } from "./seguro-form"
import { BookOpen, Building2, Download, FileText, BarChart3, FileSignature } from "lucide-react"

export default async function UniversidadDashboard() {
  const session = await auth()
  if (!session?.user || session.user.role !== "UNIVERSIDAD") redirect("/login")
  const universidadId = (session.user as { universidadId?: string }).universidadId
  if (!universidadId) redirect("/perfil")

  const universidad = await prisma.universidad.findUnique({
    where: { id: universidadId },
    include: {
      facultades: {
        include: {
          _count: { select: { carreras: true, pasantiasNotificadas: true } },
        },
      },
    },
  })
  if (!universidad) redirect("/")

  const facultadIds = universidad.facultades.map((f) => f.id)

  const pasantiasVisibles = await prisma.pasantia.findMany({
    where: { unidadAcademicaId: { in: facultadIds }, activo: true },
    include: {
      empresa: { select: { nombre: true } },
      _count: { select: { postulaciones: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const postulacionesPendientesConvenio = await prisma.postulacion.findMany({
    where: {
      pasantia: { unidadAcademicaId: { in: facultadIds } },
      estado: "ACEPTADO",
      OR: [
        { convenio: null },
        { convenio: { firmaUniversidad: false } },
      ],
    },
    include: {
      alumno: { select: { name: true, email: true } },
      pasantia: { select: { titulo: true, empresa: { select: { nombre: true } } } },
      convenio: true,
      tutorAcademico: { select: { name: true } },
      tutorEmpresa: { select: { name: true } },
    },
    orderBy: { fecha: "desc" },
  })

  const stats = {
    facultades: universidad.facultades.length,
    carreras: universidad.facultades.reduce((s, f) => s + f._count.carreras, 0),
    pasantias: pasantiasVisibles.length,
    conveniosPendientes: postulacionesPendientesConvenio.length,
  }

  return (
    <DashboardLayout nombre={session.user.name ?? "Universidad"} subtitulo={`${universidad.nombre} · ${stats.facultades} facultades, ${stats.carreras} carreras.`}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Building2 size={20} />} label="Facultades" value={stats.facultades} tone="primary" />
        <StatCard icon={<BookOpen size={20} />} label="Carreras" value={stats.carreras} tone="purple" />
        <StatCard icon={<FileText size={20} />} label="Pasantías activas" value={stats.pasantias} tone="success" />
        <StatCard icon={<FileSignature size={20} />} label="Convenios pendientes" value={stats.conveniosPendientes} hint="Requieren firma" tone={stats.conveniosPendientes > 0 ? "warning" : "primary"} />
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Link href="/universidad/reportes" className={buttonVariants({ variant: "outline" })}>
          <BarChart3 size={16} />
          Panel analítico
        </Link>
        <a href="/api/pdf/reportes" target="_blank" className={buttonVariants({ variant: "success" })}>
          <Download size={16} />
          Descargar Reporte PDF
        </a>
      </div>

      {postulacionesPendientesConvenio.length > 0 && (
        <Card className="mb-6 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><FileText size={16} /> Convenios pendientes de firma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left"><th className="pb-2 font-medium">Alumno</th><th className="pb-2 font-medium">Pasantía</th><th className="pb-2 font-medium">Empresa</th><th className="pb-2 font-medium">PDF</th><th className="pb-2 font-medium">Alumno</th><th className="pb-2 font-medium">Empresa</th><th className="pb-2 font-medium">Universidad</th><th className="pb-2 font-medium">Tutor Acad.</th><th className="pb-2 font-medium">Tutor Emp.</th><th className="pb-2 font-medium">Seguro</th></tr>
                </thead>
                <tbody>
                  {postulacionesPendientesConvenio.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2">
                        <div className="flex items-center gap-1">
                          {p.alumno.name}
                          <a
                            href={`/api/carta?postulacionId=${p.id}&tipo=presentacion`}
                            title="Descargar carta de presentación"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Download size={12} />
                          </a>
                        </div>
                      </td>
                      <td className="py-2">{p.pasantia.titulo}</td>
                      <td className="py-2 text-xs">{p.pasantia.empresa.nombre}</td>
                      <td className="py-2">
                        <a
                          href={`/api/pdf/convenio?postulacionId=${p.id}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                        >
                          <Download size={12} /> PDF
                        </a>
                      </td>
                      <td className="py-2"><ConvenioUpload postulacionId={p.id} firmado={p.convenio?.firmaAlumno || false} parte="alumno" label="Alumno" disabled fechaFirma={p.convenio?.firmaAlumnoFecha?.toISOString()} /></td>
                      <td className="py-2"><ConvenioUpload postulacionId={p.id} firmado={p.convenio?.firmaEmpresa || false} parte="empresa" label="Empresa" disabled fechaFirma={p.convenio?.firmaEmpresaFecha?.toISOString()} /></td>
                      <td className="py-2"><ConvenioUpload postulacionId={p.id} firmado={p.convenio?.firmaUniversidad || false} parte="universidad" label="Universidad" fechaFirma={p.convenio?.firmaUniversidadFecha?.toISOString()} /></td>
                      <td className="py-2 text-xs text-gray-500">{p.tutorAcademico?.name || "—"}</td>
                      <td className="py-2 text-xs text-gray-500">{p.tutorEmpresa?.name || "—"}</td>
                      <td className="py-2"><SeguroForm postulacionId={p.id} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><BookOpen size={16} /> Pasantías de la universidad</CardTitle>
        </CardHeader>
        <CardContent>
          {pasantiasVisibles.length === 0 ? (
            <p className="text-sm text-gray-500">No hay pasantías vinculadas a tus facultades.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left"><th className="pb-2 font-medium">Título</th><th className="pb-2 font-medium">Empresa</th><th className="pb-2 font-medium">Estado</th><th className="pb-2 font-medium">Post.</th><th className="pb-2 font-medium">Fecha</th></tr>
                </thead>
                <tbody>
                  {pasantiasVisibles.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{p.titulo}</td>
                      <td className="py-2 text-xs text-gray-500">{p.empresa.nombre}</td>
                      <td className="py-2"><Badge>{p.estado}</Badge></td>
                      <td className="py-2">{p._count.postulaciones}</td>
                      <td className="py-2 text-xs text-gray-400">{formatDate(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <ConvenioMarcoList />
      </div>
    </DashboardLayout>
  )
}
