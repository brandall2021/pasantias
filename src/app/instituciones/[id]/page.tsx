import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Globe, Mail, Phone } from "lucide-react"
import Link from "next/link"

interface Props {
  params: Promise<{ id: string }>
}

export default async function InstitucionPage({ params }: Props) {
  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      institucion: true,
      pasantias: {
        where: { activo: true, estado: "ABIERTA" },
        include: { resenas: { select: { puntuacion: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!user || user.role !== "INSTITUCION") notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Building2 size={32} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{user.institucion?.nombre || user.name}</h1>
                {user.institucion?.verificada && (
                  <Badge variant="success">Verificada</Badge>
                )}
              </div>
              {user.institucion?.descripcion && (
                <p className="text-gray-600 mt-2">{user.institucion.descripcion}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-sm text-gray-500">
                {user.institucion?.direccion && (
                  <span className="flex items-center gap-1"><MapPin size={14} />{user.institucion.direccion}</span>
                )}
                {user.institucion?.sitioWeb && (
                  <a href={user.institucion.sitioWeb} target="_blank" className="flex items-center gap-1 text-blue-600 hover:underline">
                    <Globe size={14} />Sitio web
                  </a>
                )}
                {user.institucion?.email && (
                  <span className="flex items-center gap-1"><Mail size={14} />{user.institucion.email}</span>
                )}
                {user.institucion?.telefono && (
                  <span className="flex items-center gap-1"><Phone size={14} />{user.institucion.telefono}</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-bold mb-4">Pasantías disponibles ({user.pasantias.length})</h2>
      {user.pasantias.length === 0 ? (
        <p className="text-gray-500">No hay pasantías disponibles en este momento.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {user.pasantias.map((p) => {
            const puntuaciones = p.resenas.map(r => r.puntuacion)
            const prom = puntuaciones.length > 0
              ? puntuaciones.reduce((a, b) => a + b, 0) / puntuaciones.length
              : 0

            return (
              <Link key={p.id} href={`/pasantias/${p.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>{p.area}</Badge>
                      <Badge variant="secondary">{p.modalidad}</Badge>
                    </div>
                    <h3 className="font-semibold">{p.titulo}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                      {p.becaEconomica && <span>Beca: ${p.becaEconomica}</span>}
                      {p.duracion && <span>{p.duracion}</span>}
                      {prom > 0 && <span>★ {prom.toFixed(1)}</span>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
