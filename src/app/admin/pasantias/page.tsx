import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { TogglePasantiaButton } from "./toggle-button"
import { ESTADOS_PASANTIA } from "@/lib/constants"

const PAGE_SIZE = 50

export default async function AdminPasantiasPage({
  searchParams,
}: {
  searchParams: Promise<{ skip?: string }>
}) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login")

  const { skip } = await searchParams
  const skipNum = Math.max(parseInt(skip || "0"), 0)

  const [pasantias, total] = await Promise.all([
    prisma.pasantia.findMany({
      include: {
        empresa: { select: { nombre: true } },
        _count: { select: { postulaciones: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: skipNum,
      take: PAGE_SIZE,
    }),
    prisma.pasantia.count(),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const currentPage = Math.floor(skipNum / PAGE_SIZE) + 1

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Todas las Pasantías</h1>
        <p className="text-sm text-gray-500">{total} pasantías</p>
      </div>

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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Link
            href={`/admin/pasantias?skip=${Math.max(skipNum - PAGE_SIZE, 0)}`}
            className={`px-3 py-1.5 text-sm rounded border ${skipNum === 0 ? "pointer-events-none opacity-30" : "hover:bg-gray-100"}`}
          >
            ← Anterior
          </Link>
          <span className="text-sm text-gray-500">
            Página {currentPage} de {totalPages}
          </span>
          <Link
            href={`/admin/pasantias?skip=${skipNum + PAGE_SIZE}`}
            className={`px-3 py-1.5 text-sm rounded border ${skipNum + PAGE_SIZE >= total ? "pointer-events-none opacity-30" : "hover:bg-gray-100"}`}
          >
            Siguiente →
          </Link>
        </div>
      )}
    </div>
  )
}
