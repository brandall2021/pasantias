import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Briefcase, Building2, Flag } from "lucide-react"
import Link from "next/link"

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login")

  const stats = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "INSTITUCION" } }),
    prisma.user.count({ where: { role: "ESTUDIANTE" } }),
    prisma.pasantia.count({ where: { activo: true } }),
    prisma.pasantia.count(),
    prisma.postulacion.count(),
    prisma.postulacion.count({ where: { estado: "PENDIENTE" } }),
    prisma.report.count({ where: { estado: "PENDIENTE" } }),
  ])

  const [totalUsuarios, totalInstituciones, totalEstudiantes, pasantiasActivas, totalPasantias, totalPostulaciones, postulacionesPendientes, reportesPendientes] = stats

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Panel Administrativo</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users size={24} className="text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalUsuarios}</p>
                <p className="text-sm text-gray-500">Usuarios totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Building2 size={24} className="text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{totalInstituciones}</p>
                <p className="text-sm text-gray-500">Instituciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Briefcase size={24} className="text-green-600" />
              <div>
                <p className="text-2xl font-bold">{pasantiasActivas}</p>
                <p className="text-sm text-gray-500">Pasantías activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Flag size={24} className="text-red-600" />
              <div>
                <p className="text-2xl font-bold">{reportesPendientes}</p>
                <p className="text-sm text-gray-500">Reportes pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/usuarios">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-6 flex items-center gap-3">
              <Users size={24} className="text-blue-600" />
              <div>
                <h3 className="font-semibold">Usuarios</h3>
                <p className="text-sm text-gray-500">{totalUsuarios} registrados ({totalEstudiantes} estudiantes, {totalInstituciones} instituciones)</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/pasantias">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-6 flex items-center gap-3">
              <Briefcase size={24} className="text-green-600" />
              <div>
                <h3 className="font-semibold">Pasantías</h3>
                <p className="text-sm text-gray-500">{totalPasantias} creadas ({pasantiasActivas} activas)</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/postulaciones">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="pt-6 flex items-center gap-3">
              <Briefcase size={24} className="text-orange-600" />
              <div>
                <h3 className="font-semibold">Postulaciones</h3>
                <p className="text-sm text-gray-500">{totalPostulaciones} totales ({postulacionesPendientes} pendientes)</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
