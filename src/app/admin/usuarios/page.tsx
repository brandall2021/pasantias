import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { BanUserButton } from "./ban-button"

const PAGE_SIZE = 50

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ skip?: string; q?: string }>
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login")

  const { skip, q } = await searchParams
  const skipNum = Math.max(parseInt(skip || "0"), 0)

  const where = q
    ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { email: { contains: q, mode: "insensitive" as const } }] }
    : {}

  const [usuarios, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { empresa: true, _count: { select: { postulaciones: true } } },
      orderBy: { createdAt: "desc" },
      skip: skipNum,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const currentPage = Math.floor(skipNum / PAGE_SIZE) + 1

  const roleLabel: Record<string, string> = {
    ESTUDIANTE: "Estudiante",
    EMPRESA: "Empresa",
    UNIVERSIDAD: "Universidad",
    TUTOR_EMPRESA: "Tutor Empresa",
    TUTOR_ACADEMICO: "Tutor Académico",
    ADMIN: "Admin",
  }

  const roleVariant: Record<string, "destructive" | "default" | "secondary" | "success" | "warning"> = {
    ADMIN: "destructive",
    EMPRESA: "default",
    UNIVERSIDAD: "default",
    TUTOR_EMPRESA: "secondary",
    TUTOR_ACADEMICO: "secondary",
    ESTUDIANTE: "secondary",
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Usuarios</h1>
          <p className="mt-1 text-sm text-gray-500">Gestión de cuentas del sistema.</p>
        </div>
        <span className="text-sm font-medium text-gray-500">{total} usuarios</span>
      </header>

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
                      <Link href={`/admin/usuarios/${u.id}`} className="text-primary-600 hover:underline">
                        {u.name}
                      </Link>
                    </td>
                    <td className="py-3 text-gray-500">{u.email}</td>
                    <td className="py-3">
                      <Badge variant={roleVariant[u.role] || "secondary"}>
                        {roleLabel[u.role] || u.role}
                      </Badge>
                    </td>
                    <td className="py-3">
                      {u.baneado ? (
                        <Badge variant="destructive">Baneado</Badge>
                      ) : u.deletedAt ? (
                        <Badge variant="destructive">Eliminado</Badge>
                      ) : u.verified ? (
                        <Badge variant="success">Verificado</Badge>
                      ) : (
                        <Badge variant="warning">Sin verificar</Badge>
                      )}
                    </td>
                    <td className="py-3 text-xs text-gray-400">
                      {u.empresa?.nombre && <div>{u.empresa.nombre}</div>}
                      {u._count.postulaciones > 0 && <div>{u._count.postulaciones} postulaciones</div>}
                      <div>Registro: {formatDate(u.createdAt)}</div>
                    </td>
                    <td className="py-3">
                      <BanUserButton userId={u.id} baneado={u.baneado ?? false} userName={u.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Link
            href={`/admin/usuarios?skip=${Math.max(skipNum - PAGE_SIZE, 0)}`}
            className={`px-3 py-1.5 text-sm rounded border ${skipNum === 0 ? "pointer-events-none opacity-30" : "hover:bg-gray-100"}`}
          >
            ← Anterior
          </Link>
          <span className="text-sm text-gray-500">
            Página {currentPage} de {totalPages}
          </span>
          <Link
            href={`/admin/usuarios?skip=${skipNum + PAGE_SIZE}`}
            className={`px-3 py-1.5 text-sm rounded border ${skipNum + PAGE_SIZE >= total ? "pointer-events-none opacity-30" : "hover:bg-gray-100"}`}
          >
            Siguiente →
          </Link>
        </div>
      )}
    </div>
  )
}
