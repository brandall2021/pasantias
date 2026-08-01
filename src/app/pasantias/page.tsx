import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { AREAS } from "@/lib/constants"
import { SearchIcon, Briefcase } from "lucide-react"
import type { Prisma } from "@prisma/client"

interface Props {
  searchParams: Promise<{ q?: string; area?: string; modalidad?: string }>
}

export default async function PasantiasPage({ searchParams }: Props) {
  const params = await searchParams

  const where: Prisma.PasantiaWhereInput = { activo: true, estado: "PUBLICADA" }
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
      empresa: { select: { nombre: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          <Briefcase className="text-primary-600" size={28} />
          Buscar Pasantías
        </h1>
        <p className="mt-1 text-sm text-gray-500">Oportunidades publicadas por empresas para estudiantes universitarios.</p>
      </header>

      <form className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input name="q" placeholder="Buscar pasantías..." defaultValue={params.q} className="pl-10" />
        </div>
        <Select name="area" className="sm:w-56">
          <option value="">Todas las áreas</option>
          {AREAS.map((a) => (
            <option key={a.value} value={a.value} selected={params.area === a.value}>{a.label}</option>
          ))}
        </Select>
        <Select name="modalidad" className="sm:w-56">
          <option value="">Todas las modalidades</option>
          <option value="PRESENCIAL" selected={params.modalidad === "PRESENCIAL"}>Presencial</option>
          <option value="HIBRIDA" selected={params.modalidad === "HIBRIDA"}>Híbrida</option>
          <option value="REMOTA" selected={params.modalidad === "REMOTA"}>Remota</option>
        </Select>
        <Button type="submit">Buscar</Button>
      </form>

      {pasantias.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No se encontraron pasantías con esos filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pasantias.map((p) => (
            <Link key={p.id} href={`/pasantias/${p.id}`}>
              <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-card-hover cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <Badge>{p.area}</Badge>
                    <Badge variant="secondary">{p.modalidad}</Badge>
                  </div>
                  <h3 className="font-semibold mb-1">{p.titulo}</h3>
                  <p className="text-sm text-gray-500 mb-2">{p.empresa.nombre}</p>
                  {p.becaEconomica && (
                    <p className="text-sm font-medium text-success-600 mb-1">Beca: ${p.becaEconomica}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                    {p.duracion && <span>Duración: {p.duracion}</span>}
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
