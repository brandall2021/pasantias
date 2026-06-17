import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { TogglePasantiaButton } from "./toggle-button"
import { ESTADOS_PASANTIA } from "@/lib/constants"

export default async function AdminPasantiasPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login")

  const pasantias = await prisma.pasantia.findMany({
    include: {
      empresa: { select: { nombre: true } },
      _count: { select: { postulaciones: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Todas las Pasantías</h1>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">Título</th>
                  <th className="pb-3 font-medium">Empresa</th>
                  <th className="pb-3 font-medium">Área</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium">Activo</th>
                  <th className="pb-3 font-medium">Post.</th>
                  <th className="pb-3 font-medium">Fecha</th>
                  <th className="pb-3 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {pasantias.map((p) => {
                  const estado = ESTADOS_PASANTIA[p.estado] || ESTADOS_PASANTIA.BORRADOR
                  return (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{p.titulo}</td>
                      <td className="py-3 text-gray-500">{p.empresa.nombre}</td>
                      <td className="py-3"><Badge>{p.area}</Badge></td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estado.color}`}>{estado.label}</span>
                      </td>
                      <td className="py-3">
                        {p.activo ? (
                          <Badge variant="success">Sí</Badge>
                        ) : (
                          <Badge variant="destructive">No</Badge>
                        )}
                      </td>
                      <td className="py-3">{p._count.postulaciones}</td>
                      <td className="py-3 text-xs text-gray-400">{formatDate(p.createdAt)}</td>
                      <td className="py-3">
                        <TogglePasantiaButton pasantiaId={p.id} activo={p.activo} titulo={p.titulo} />
                      </td>
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
