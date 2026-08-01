import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { ValidarEmpresaButton } from "./validar-button"

export default async function AdminEmpresasPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login")

  const empresas = await prisma.empresa.findMany({
    include: {
      _count: { select: { pasantias: true, usuarios: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Empresas</h1>
        <p className="mt-1 text-sm text-gray-500">Validación y gestión de empresas registradas.</p>
      </header>
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">Nombre</th>
                  <th className="pb-3 font-medium">CUIT</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium">Pasantías</th>
                  <th className="pb-3 font-medium">Usuarios</th>
                  <th className="pb-3 font-medium">Registro</th>
                  <th className="pb-3 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {empresas.map((e) => (
                  <tr key={e.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{e.nombre}</td>
                    <td className="py-3 text-gray-500">{e.cuit}</td>
                    <td className="py-3 text-xs text-gray-500">{e.email || "-"}</td>
                    <td className="py-3">
                      {e.estado === "VALIDADA" ? (
                        <Badge variant="success">Validada</Badge>
                      ) : e.estado === "RECHAZADA" ? (
                        <Badge variant="destructive">Rechazada</Badge>
                      ) : (
                        <Badge variant="warning">Pendiente</Badge>
                      )}
                    </td>
                    <td className="py-3">{e._count.pasantias}</td>
                    <td className="py-3">{e._count.usuarios}</td>
                    <td className="py-3 text-xs text-gray-400">{formatDate(e.createdAt)}</td>
                    <td className="py-3">
                      <ValidarEmpresaButton empresaId={e.id} estado={e.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
