import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { EvaluacionForm } from "./evaluacion-form"

export default async function EvaluacionesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userId = session.user.id
  const role = session.user.role

  let postulacionesParaEvaluar: any[] = []
  let evaluacionesRealizadas: any[] = []

  if (role === "ESTUDIANTE") {
    postulacionesParaEvaluar = await prisma.postulacion.findMany({
      where: { alumnoId: userId, pasantia: { estado: "FINALIZADA" } },
      include: {
        pasantia: { select: { titulo: true, empresa: { select: { nombre: true } } } },
        convenio: { include: { evaluaciones: true } },
      },
      orderBy: { fecha: "desc" },
    })
  } else if (role === "EMPRESA") {
    const empresaId = (session.user as any).empresaId
    if (empresaId) {
      postulacionesParaEvaluar = await prisma.postulacion.findMany({
        where: { pasantia: { empresaId, estado: "FINALIZADA" } },
        include: {
          alumno: { select: { name: true } },
          pasantia: { select: { titulo: true } },
          convenio: { include: { evaluaciones: true } },
        },
        orderBy: { fecha: "desc" },
      })
    }
  }

  evaluacionesRealizadas = await prisma.evaluacion.findMany({
    where: { autorId: userId },
    include: {
      convenio: {
        include: {
          postulacion: {
            include: {
              pasantia: { select: { titulo: true } },
              alumno: { select: { name: true } },
            },
          },
        },
      },
    },
    orderBy: { fecha: "desc" },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Evaluaciones</h1>

      {postulacionesParaEvaluar.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Pasantías finalizadas por evaluar</h2>
          <div className="space-y-3">
            {postulacionesParaEvaluar.map((p) => {
              const yaEvaluo = p.convenio?.evaluaciones?.some(
                (e: any) => e.autorId === userId
              )
              return (
                <Card key={p.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium">{p.pasantia.titulo}</p>
                        <p className="text-sm text-gray-500">
                          {role === "EMPRESA" ? p.alumno.name : p.pasantia.empresa.nombre}
                        </p>
                      </div>
                      {yaEvaluo ? (
                        <Badge variant="secondary">Ya evaluada</Badge>
                      ) : (
                        <Badge>Pendiente</Badge>
                      )}
                    </div>
                    {!yaEvaluo && (
                      <EvaluacionForm
                        postulacionId={p.id}
                        tipo={role === "EMPRESA" ? "EMPRESA_A_ALUMNO" : "ALUMNO_A_EMPRESA"}
                      />
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-3">Mis evaluaciones realizadas</h2>
      {evaluacionesRealizadas.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12 text-gray-500">
            <p>No realizaste evaluaciones todavía.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {evaluacionesRealizadas.map((e) => (
            <Card key={e.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{e.convenio.postulacion.pasantia.titulo}</p>
                    <p className="text-xs text-gray-500">
                      {e.tipo === "EMPRESA_A_ALUMNO" ? "Empresa → Alumno" :
                       e.tipo === "ALUMNO_A_EMPRESA" ? "Alumno → Empresa" : "Tutor"}
                    </p>
                    {e.comentario && <p className="text-sm text-gray-600 mt-1">{e.comentario}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-yellow-600">{e.puntaje}/5</p>
                    <p className="text-xs text-gray-400">{formatDate(e.fecha)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
