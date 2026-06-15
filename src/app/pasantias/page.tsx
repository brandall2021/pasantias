import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AREAS } from "@/lib/constants"
import { SearchIcon } from "lucide-react"

interface Props {
  searchParams: Promise<{ q?: string; area?: string; modalidad?: string }>
}

export default async function PasantiasPage({ searchParams }: Props) {
  const params = await searchParams

  const where: any = { activo: true, estado: "ABIERTA" }
  if (params.q) {
    where.OR = [
      { titulo: { contains: params.q, mode: "insensitive" } },
      { descripcion: { contains: params.q, mode: "insensitive" } },
    ]
  }
  if (params.area) where.area = params.area
  if (params.modalidad) where.modalidad = params.modalidad

  const pasantias = await prisma.pasantia.findMany({
    where,
    include: {
      institucion: { select: { name: true } },
      resenas: { select: { puntuacion: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Buscar Pasantías</h1>

      <form className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input name="q" placeholder="Buscar pasantías..." defaultValue={params.q} className="pl-10" />
        </div>
        <select name="area" className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todas las áreas</option>
          {AREAS.map((a) => (
            <option key={a.value} value={a.value} selected={params.area === a.value}>{a.label}</option>
          ))}
        </select>
        <select name="modalidad" className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todas las modalidades</option>
          <option value="PRESENCIAL" selected={params.modalidad === "PRESENCIAL"}>Presencial</option>
          <option value="HIBRIDA" selected={params.modalidad === "HIBRIDA"}>Híbrida</option>
          <option value="REMOTA" selected={params.modalidad === "REMOTA"}>Remota</option>
        </select>
        <Button type="submit">Buscar</Button>
      </form>

      {pasantias.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No se encontraron pasantías con esos filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pasantias.map((p) => {
            const puntuaciones = p.resenas.map(r => r.puntuacion)
            const promedio = puntuaciones.length > 0
              ? puntuaciones.reduce((a, b) => a + b, 0) / puntuaciones.length
              : 0

            return (
              <Link key={p.id} href={`/pasantias/${p.id}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-2">
                      <Badge>{p.area}</Badge>
                      <Badge variant="secondary">{p.modalidad}</Badge>
                    </div>
                    <h3 className="font-semibold mb-1">{p.titulo}</h3>
                    <p className="text-sm text-gray-500 mb-2">{p.institucion.name}</p>
                    {p.becaEconomica && (
                      <p className="text-sm font-medium text-green-600 mb-1">Beca: ${p.becaEconomica}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                      {p.duracion && <span>Duración: {p.duracion}</span>}
                      {promedio > 0 && <span>★ {promedio.toFixed(1)}</span>}
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
