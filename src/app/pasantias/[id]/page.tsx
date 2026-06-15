import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { StarRating } from "@/components/shared/star-rating"
import { formatDate } from "@/lib/utils"
import { PostularButton } from "./postular-button"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { MapPin, Clock, DollarSign, Users, Building2 } from "lucide-react"

interface Props {
  params: Promise<{ id: string }>
}

export default async function PasantiaDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()

  const pasantia = await prisma.pasantia.findUnique({
    where: { id },
    include: {
      institucion: { include: { institucion: true } },
      resenas: {
        include: { emisor: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
      postulaciones: session?.user
        ? { where: { estudianteId: session.user.id } }
        : false,
    },
  })

  if (!pasantia) notFound()

  const yaPostulado = Array.isArray(pasantia.postulaciones) && pasantia.postulaciones.length > 0
  const puntuaciones = pasantia.resenas.map(r => r.puntuacion)
  const promedio = puntuaciones.length > 0
    ? puntuaciones.reduce((a, b) => a + b, 0) / puntuaciones.length
    : 0

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge>{pasantia.area}</Badge>
                <Badge variant="secondary">{pasantia.modalidad}</Badge>
                {pasantia.estado === "ABIERTA" ? (
                  <Badge variant="success">Activa</Badge>
                ) : (
                  <Badge variant="destructive">Cerrada</Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold">{pasantia.titulo}</h1>
            </div>

            {session?.user && pasantia.activo && pasantia.estado === "ABIERTA" && (
              <PostularButton
                pasantiaId={pasantia.id}
                yaPostulado={yaPostulado}
                userId={session.user.id}
              />
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <Link href={`/instituciones/${pasantia.institucion.id}`} className="flex items-center gap-1 hover:text-blue-600">
              <Building2 size={16} />
              {pasantia.institucion.name}
              {pasantia.institucion.institucion?.verificada && (
                <Badge variant="success" className="ml-1">Verificada</Badge>
              )}
            </Link>
          </div>

          {promedio > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating value={Math.round(promedio)} readonly />
              <span className="text-sm text-gray-500">({pasantia.resenas.length} reseñas)</span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            {pasantia.becaEconomica && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign size={16} className="text-green-600" />
                <span>Beca: ${pasantia.becaEconomica}</span>
              </div>
            )}
            {pasantia.duracion && (
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-blue-600" />
                <span>{pasantia.duracion}</span>
              </div>
            )}
            {pasantia.cargaHoraria && (
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-gray-600" />
                <span>{pasantia.cargaHoraria} hs</span>
              </div>
            )}
            {pasantia.vacantes && (
              <div className="flex items-center gap-2 text-sm">
                <Users size={16} className="text-gray-600" />
                <span>{pasantia.vacantes} vacante{pasantia.vacantes !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h2 className="font-semibold mb-2">Descripción</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line">{pasantia.descripcion}</p>
          </div>

          {pasantia.requisitos && (
            <div className="mb-6">
              <h2 className="font-semibold mb-2">Requisitos</h2>
              <p className="text-sm text-gray-600 whitespace-pre-line">{pasantia.requisitos}</p>
            </div>
          )}

          <p className="text-xs text-gray-400">
            Publicada el {formatDate(pasantia.createdAt)}
          </p>
        </CardContent>
      </Card>

      {pasantia.resenas.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Reseñas</h2>
          <div className="space-y-4">
            {pasantia.resenas.map((r) => (
              <Card key={r.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{r.emisor.name}</span>
                    <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                  </div>
                  <StarRating value={r.puntuacion} readonly size={16} />
                  {r.comentario && (
                    <p className="text-sm text-gray-600 mt-2">{r.comentario}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
