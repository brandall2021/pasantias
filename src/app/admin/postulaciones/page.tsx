import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"


export default async function AdminPostulacionesPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login")

  const postulaciones = await prisma.postulacion.findMany({
    include: {
      estudiante: { select: { name: true, email: true } },
      pasantia: { select: { titulo: true, institucionId: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  const estados: Record<string, { label: string; color: string }> = {
    PENDIENTE: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
    REVISADO: { label: "Revisado", color: "bg-blue-100 text-blue-800" },
    ACEPTADO: { label: "Aceptado", color: "bg-green-100 text-green-800" },
    RECHAZADO: { label: "Rechazado", color: "bg-red-100 text-red-800" },
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Postulaciones</h1>
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">Estudiante</th>
                  <th className="pb-3 font-medium">Pasantía</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium">CV</th>
                  <th className="pb-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {postulaciones.map((p) => {
                  const estado = estados[p.estado] || estados.PENDIENTE
                  return (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-3">{p.estudiante.name}<br /><span className="text-xs text-gray-400">{p.estudiante.email}</span></td>
                      <td className="py-3">{p.pasantia.titulo}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estado.color}`}>{estado.label}</span>
                      </td>
                      <td className="py-3">
                        {p.cvUrl ? (
                          <a href={p.cvUrl} target="_blank" className="text-blue-600 hover:underline text-xs">Ver CV</a>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 text-xs text-gray-400">{formatDate(p.createdAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
