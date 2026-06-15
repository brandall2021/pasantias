import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Building2, Users, Briefcase, Star, ArrowRight } from "lucide-react"

async function getFeaturedData() {
  const pasantias = await prisma.pasantia.findMany({
    where: { activo: true, estado: "ABIERTA" },
    include: {
      institucion: { select: { name: true } },
      resenas: { select: { puntuacion: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  })

  const instituciones = await prisma.user.findMany({
    where: { role: "INSTITUCION" },
    include: { institucion: true, pasantias: { where: { activo: true } } },
    take: 4,
  })

  return { pasantias, instituciones }
}

export default async function Home() {
  const { pasantias, instituciones } = await getFeaturedData()

  return (
    <div>
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Encontrá la pasantía ideal para tu futuro
            </h1>
            <p className="text-lg text-blue-100 mb-8">
              Conectamos estudiantes con instituciones para impulsar su desarrollo profesional.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/pasantias">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  <Search size={18} />
                  Buscar Pasantías
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-12">¿Cómo funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-blue-600" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Buscá oportunidades</h3>
                <p className="text-sm text-gray-500">Encontrá pasantías por área, modalidad y ubicación.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-blue-600" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Postulate</h3>
                <p className="text-sm text-gray-500">Aplicá con tu CV y seguí el estado de tus postulaciones.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="text-blue-600" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Crece profesionalmente</h3>
                <p className="text-sm text-gray-500">Sumá experiencia y construí tu futuro profesional.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Últimas pasantías</h2>
            <Link href="/pasantias" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
              Ver todas <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pasantias.map((p) => (
              <Link key={p.id} href={`/pasantias/${p.id}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge>{p.area}</Badge>
                      <Badge variant="secondary">{p.modalidad}</Badge>
                    </div>
                    <h3 className="font-semibold mb-1">{p.titulo}</h3>
                    <p className="text-sm text-gray-500 mb-3">{p.institucion.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      {p.becaEconomica && <span>${p.becaEconomica}</span>}
                      {p.duracion && <span>· {p.duracion}</span>}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-8">Instituciones destacadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {instituciones.map((inst) => (
              <Link key={inst.id} href={`/instituciones/${inst.id}`}>
                <Card className="text-center hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Building2 className="text-blue-600" size={28} />
                    </div>
                    <h3 className="font-semibold">{inst.institucion?.nombre || inst.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {inst.pasantias.length} pasantía{inst.pasantias.length !== 1 ? "s" : ""}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
