import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { ConvenioUpload } from "@/components/convenio-upload"
import { BookOpen, Building2, FileText, Users } from "lucide-react"

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Building2 size={28} className="text-green-600" />
        <h1 className="text-2xl font-bold">{universidad.nombre}</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-green-600">{stats.facultades}</p><p className="text-sm text-gray-500">Facultades</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-blue-600">{stats.carreras}</p><p className="text-sm text-gray-500">Carreras</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-purple-600">{stats.pasantias}</p><p className="text-sm text-gray-500">Pasantías activas</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className={`text-2xl font-bold ${stats.conveniosPendientes > 0 ? "text-yellow-600" : "text-gray-600"}`}>{stats.conveniosPendientes}</p><p className="text-sm text-gray-500">Convenios pendientes</p></CardContent></Card>
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
                  <tr className="border-b text-left"><th className="pb-2 font-medium">Alumno</th><th className="pb-2 font-medium">Pasantía</th><th className="pb-2 font-medium">Empresa</th><th className="pb-2 font-medium">Alumno</th><th className="pb-2 font-medium">Empresa</th><th className="pb-2 font-medium">Universidad</th><th className="pb-2 font-medium">Tutor Acad.</th><th className="pb-2 font-medium">Tutor Emp.</th></tr>
                </thead>
                <tbody>
                  {postulacionesPendientesConvenio.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2">{p.alumno.name}</td>
                      <td className="py-2">{p.pasantia.titulo}</td>
                      <td className="py-2 text-xs">{p.pasantia.empresa.nombre}</td>
                      <td className="py-2"><ConvenioUpload postulacionId={p.id} firmado={p.convenio?.firmaAlumno || false} parte="alumno" label="Alumno" disabled /></td>
                      <td className="py-2"><ConvenioUpload postulacionId={p.id} firmado={p.convenio?.firmaEmpresa || false} parte="empresa" label="Empresa" disabled /></td>
                      <td className="py-2"><ConvenioUpload postulacionId={p.id} firmado={p.convenio?.firmaUniversidad || false} parte="universidad" label="Universidad" /></td>
                      <td className="py-2 text-xs text-gray-500">{p.tutorAcademico?.name || "—"}</td>
                      <td className="py-2 text-xs text-gray-500">{p.tutorEmpresa?.name || "—"}</td>
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
    </div>
  )
}
