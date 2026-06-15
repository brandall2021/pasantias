import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"

export default async function MisPasantiasPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "INSTITUCION") redirect("/login")

  const pasantias = await prisma.pasantia.findMany({
    where: { institucionId: session.user.id },
    include: {
      _count: { select: { postulaciones: true } },
      resenas: { select: { puntuacion: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const totalResenas = pasantias.flatMap(p => p.resenas)
  const promedio = totalResenas.length > 0
    ? totalResenas.reduce((a, r) => a + r.puntuacion, 0) / totalResenas.length
    : 0

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mis Pasantías</h1>
          {promedio > 0 && (
            <p className="text-sm text-gray-500 mt-1">Valoración promedio: ★ {promedio.toFixed(1)}</p>
          )}
        </div>
        <Link href="/perfil/pasantias/nueva">
          <Button>
            <Plus size={16} />
            Nueva Pasantía
          </Button>
        </Link>
      </div>

      {pasantias.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">Todavía no publicaste ninguna pasantía.</p>
          <Link href="/perfil/pasantias/nueva">
            <Button>Publicar primera pasantía</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pasantias.map((p) => (
            <Link key={p.id} href={`/perfil/pasantias/${p.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge>{p.area}</Badge>
                        {p.estado === "ABIERTA" ? (
                          <Badge variant="success">Activa</Badge>
                        ) : (
                          <Badge variant="secondary">{p.estado}</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold">{p.titulo}</h3>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{p._count.postulaciones} postulación{p._count.postulaciones !== 1 ? "es" : ""}</p>
                      <p>{p.resenas.length} reseña{p.resenas.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
