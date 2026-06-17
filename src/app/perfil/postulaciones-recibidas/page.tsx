import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { ConvenioUpload } from "@/components/convenio-upload"
import { UpdatePostulacionEstado } from "./update-estado"

export default async function PostulacionesRecibidasPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "EMPRESA") redirect("/login")
  if (!session.user.empresaId) redirect("/perfil")

  const postulaciones = await prisma.postulacion.findMany({
    where: { pasantia: { empresaId: session.user.empresaId } },
    include: {
      alumno: { select: { name: true, email: true } },
      pasantia: { select: { titulo: true } },
      convenio: true,
    },
    orderBy: { fecha: "desc" },
  })

  const estados: Record<string, { label: string; color: string }> = {
    PENDIENTE: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
    REVISADO: { label: "Revisado", color: "bg-blue-100 text-blue-800" },
    ACEPTADO: { label: "Aceptado", color: "bg-green-100 text-green-800" },
    RECHAZADO: { label: "Rechazado", color: "bg-red-100 text-red-800" },
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Postulaciones Recibidas</h1>

      {postulaciones.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12 text-gray-500">
            <p>No tenés postulaciones para tus pasantías</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Estudiante</th>
                    <th className="pb-3 font-medium">Pasantía</th>
                    <th className="pb-3 font-medium">Estado</th>
                    <th className="pb-3 font-medium">Convenio</th>
                    <th className="pb-3 font-medium">Fecha</th>
                    <th className="pb-3 font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {postulaciones.map((p) => {
                    const estado = estados[p.estado] || estados.PENDIENTE
                    return (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="py-3">{p.alumno.name}<br /><span className="text-xs text-gray-400">{p.alumno.email}</span></td>
                        <td className="py-3">{p.pasantia.titulo}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estado.color}`}>{estado.label}</span>
                        </td>
                        <td className="py-3 min-w-[180px]">
                          <div className="space-y-2">
                            <ConvenioUpload postulacionId={p.id} firmado={p.convenio?.firmaAlumno || false} parte="alumno" label="Estudiante" disabled />
                            <ConvenioUpload postulacionId={p.id} firmado={p.convenio?.firmaEmpresa || false} parte="empresa" label="Mi empresa" />
                          </div>
                        </td>
                        <td className="py-3 text-xs text-gray-400">{formatDate(p.fecha)}</td>
                        <td className="py-3">
                          <UpdatePostulacionEstado postulacionId={p.id} estado={p.estado} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
