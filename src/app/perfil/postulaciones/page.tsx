import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { ConvenioUpload } from "@/components/convenio-upload"

export default async function MisPostulacionesPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ESTUDIANTE") redirect("/login")

  const postulaciones = await prisma.postulacion.findMany({
    where: { alumnoId: session.user.id },
    include: {
      pasantia: {
        select: { id: true, titulo: true, area: true, modalidad: true, becaEconomica: true },
      },
      convenio: true,
    },
    orderBy: { fecha: "desc" },
  })

  const estados: Record<string, { label: string; color: string }> = {
    PENDIENTE: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
    REVISADO: { label: "Revisado", color: "bg-blue-100 text-blue-800" },
    ACEPTADO: { label: "Aceptado", color: "bg-green-100 text-green-800" },
    RECHAZADO: { label: "Rechazado", color: "bg-red-100 text-red-800" },
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Mis Postulaciones</h1>

      {postulaciones.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">Todavía no te postulaste a ninguna pasantía.</p>
          <Link href="/pasantias" className="text-blue-600 hover:underline">Buscar pasantías</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {postulaciones.map((p) => {
            const estado = estados[p.estado] || estados.PENDIENTE

            return (
              <Link key={p.id} href={`/pasantias/${p.pasantia.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{p.pasantia.titulo}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{p.pasantia.area}</Badge>
                          <Badge variant="secondary">{p.pasantia.modalidad}</Badge>
                        </div>
                        {p.pasantia.becaEconomica && (
                          <p className="text-xs text-gray-400 mt-1">Beca: ${p.pasantia.becaEconomica}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Postulado el {formatDate(p.fecha)}
                        </p>
                        {p.estado === "ACEPTADO" && (
                          <div className="mt-3 pt-3 border-t" onClick={(e) => e.preventDefault()}>
                            <p className="text-xs font-medium text-gray-700 mb-2">Convenio Tripartito</p>
                            <ConvenioUpload
                              postulacionId={p.id}
                              firmado={p.convenio?.firmaAlumno || false}
                              parte="alumno"
                              label="Tu firma"
                            />
                          </div>
                        )}
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${estado.color}`}>
                        {estado.label}
                      </span>
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
