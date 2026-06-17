import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { BanUserButton } from "./ban-button"

export default async function AdminUsuariosPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login")

  const usuarios = await prisma.user.findMany({
    include: { institucion: true, _count: { select: { pasantias: true, postulaciones: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Usuarios</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">Nombre</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Rol</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium">Actividad</th>
                  <th className="pb-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-3">
                      <Link href={`/admin/usuarios/${u.id}`} className="text-blue-600 hover:underline">
                        {u.name}
                      </Link>
                    </td>
                    <td className="py-3 text-gray-500">{u.email}</td>
                    <td className="py-3">
                      <Badge variant={
                        u.role === "ADMIN" ? "destructive" :
                        u.role === "INSTITUCION" ? "default" : "secondary"
                      }>
                        {u.role === "ESTUDIANTE" ? "Estudiante" :
                         u.role === "INSTITUCION" ? "Institución" : "Admin"}
                      </Badge>
                    </td>
                    <td className="py-3">
                      {u.baneado ? (
                        <Badge variant="destructive">Baneado</Badge>
                      ) : u.verified ? (
                        <Badge variant="success">Verificado</Badge>
                      ) : (
                        <Badge variant="warning">Sin verificar</Badge>
                      )}
                    </td>
                    <td className="py-3 text-xs text-gray-400">
                      {u._count.pasantias > 0 && <div>{u._count.pasantias} pasantías</div>}
                      {u._count.postulaciones > 0 && <div>{u._count.postulaciones} postulaciones</div>}
                      <div>Registro: {formatDate(u.createdAt)}</div>
                    </td>
                    <td className="py-3">
                      <BanUserButton userId={u.id} baneado={u.baneado} userName={u.name} />
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
