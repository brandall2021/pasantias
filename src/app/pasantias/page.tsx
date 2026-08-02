import { prisma } from "@/lib/prisma"
import Link from "next/link"
import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { AREAS, getAreaColor, getAreaLabel, getModalidadLabel } from "@/lib/constants"
import { cn, formatARS } from "@/lib/utils"
import { SearchIcon, Briefcase, SearchX, ChevronLeft, ChevronRight } from "lucide-react"
import type { Prisma } from "@prisma/client"

interface Props {
  searchParams: Promise<{ q?: string; area?: string; modalidad?: string; page?: string }>
}

export const metadata: Metadata = {
  title: "Buscar Pasantías",
  description:
    "Encontrá pasantías por área, modalidad y ubicación. Postulate gratis a las oportunidades publicadas por empresas para estudiantes universitarios.",
  alternates: { canonical: "/pasantias" },
  openGraph: {
    title: "Buscar Pasantías | Gestión de Pasantías",
    description: "Encontrá pasantías por área, modalidad y ubicación.",
    url: "https://pasantias.softgroup.com.ar/pasantias",
    type: "website",
  },
}

const PER_PAGE = 12

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

  const requestedPage = Math.max(1, Number(params.page ?? 1) || 1)

  const total = await prisma.pasantia.count({ where })
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))
  const currentPage = Math.min(requestedPage, totalPages)

  const pasantias = await prisma.pasantia.findMany({
    where,
    include: {
      empresa: { select: { nombre: true } },
    },
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * PER_PAGE,
    take: PER_PAGE,
  })

  const qs = new URLSearchParams()
  if (params.q) qs.set("q", params.q)
  if (params.area) qs.set("area", params.area)
  if (params.modalidad) qs.set("modalidad", params.modalidad)

  const prevPage = currentPage > 1 ? `?${qs.toString()}${qs.size > 0 ? "&" : ""}page=${currentPage - 1}` : null
  const nextPage = currentPage < totalPages ? `?${qs.toString()}${qs.size > 0 ? "&" : ""}page=${currentPage + 1}` : null
  const hasFilters = Boolean(params.q || params.area || params.modalidad)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          <Briefcase className="text-primary-600" size={28} />
          Buscar Pasantías
        </h1>
        <p className="mt-1 text-sm text-gray-600">Oportunidades publicadas por empresas para estudiantes universitarios.</p>
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
        <div className="text-center py-16">
          <SearchX className="mx-auto mb-4 text-gray-300" size={48} />
          <h2 className="text-lg font-semibold text-gray-900">No encontramos pasantías con esos filtros</h2>
          <p className="mt-1 text-sm text-gray-600">
            Probá con otros términos o limpiá los filtros para ver todas las oportunidades.
          </p>
          {hasFilters && (
            <Link href="/pasantias" className={cn(buttonVariants({ variant: "outline" }), "mt-5")}>
              Limpiar búsqueda
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pasantias.map((p) => {
              const beca = formatARS(p.becaEconomica)
              return (
                <Link key={p.id} href={`/pasantias/${p.id}`}>
                  <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-card-hover cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge className={getAreaColor(p.area)}>{getAreaLabel(p.area)}</Badge>
                        <Badge variant="secondary">{getModalidadLabel(p.modalidad)}</Badge>
                      </div>
                      <h3 className="font-semibold mb-1">{p.titulo}</h3>
                      <p className="text-sm text-gray-600 mb-2">{p.empresa.nombre}</p>
                      {beca && (
                        <p className="text-sm font-medium text-success-600 mb-1">Beca: {beca}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-600 mt-2">
                        {p.duracion && <span>Duración: {p.duracion}</span>}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>

          {totalPages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-4" aria-label="Paginación de pasantías">
              {prevPage ? (
                <Link href={prevPage} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  <ChevronLeft size={16} />
                  Anterior
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft size={16} />
                  Anterior
                </Button>
              )}
              <span className="text-sm text-gray-600">
                Página {currentPage} de {totalPages} · {total} pasantía{total !== 1 ? "s" : ""}
              </span>
              {nextPage ? (
                <Link href={nextPage} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Siguiente
                  <ChevronRight size={16} />
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Siguiente
                  <ChevronRight size={16} />
                </Button>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  )
}
