import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { PostularButton } from "./postular-button"
import { auth } from "@/lib/auth"
import { Clock, DollarSign, Users, Building2 } from "lucide-react"
import { ESTADOS_PASANTIA } from "@/lib/constants"

interface Props {
  params: Promise<{ id: string }>
}

export default async function PasantiaDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()

  const pasantia = await prisma.pasantia.findUnique({
    where: { id },
    include: {
      empresa: { select: { id: true, nombre: true } },
      postulaciones: session?.user
        ? { where: { alumnoId: session.user.id } }
        : false,
    },
  })

  if (!pasantia) notFound()

  const estado = ESTADOS_PASANTIA[pasantia.estado] || { label: pasantia.estado, color: "bg-gray-100 text-gray-800" }
  const yaPostulado = Array.isArray(pasantia.postulaciones) && pasantia.postulaciones.length > 0

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge>{pasantia.area}</Badge>
                <Badge variant="secondary">{pasantia.modalidad}</Badge>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estado.color}`}>{estado.label}</span>
              </div>
              <h1 className="text-2xl font-bold">{pasantia.titulo}</h1>
            </div>

            {session?.user && pasantia.activo && pasantia.estado === "PUBLICADA" && (
              <PostularButton
                pasantiaId={pasantia.id}
                yaPostulado={yaPostulado}
                userId={session.user.id}
              />
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Building2 size={16} />
              {pasantia.empresa.nombre}
            </div>
          </div>

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
    </div>
  )
}
