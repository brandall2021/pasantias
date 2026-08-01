import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Users, Star, ArrowRight, Building2, Briefcase, FileSignature, Sparkles } from "lucide-react"

async function getLandingData() {
  const [pasantias, empresas, stats] = await Promise.all([
    prisma.pasantia.findMany({
      where: { activo: true, estado: "PUBLICADA" },
      include: { empresa: { select: { nombre: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.empresa.findMany({
      where: { estado: "VALIDADA" },
      include: { _count: { select: { pasantias: { where: { activo: true } } } } },
      take: 6,
    }),
    Promise.all([
      prisma.empresa.count({ where: { estado: "VALIDADA" } }),
      prisma.user.count({ where: { role: "ESTUDIANTE" } }),
      prisma.pasantia.count({ where: { activo: true } }),
      prisma.convenio.count({ where: { estado: "COMPLETADO" } }),
    ]),
  ])

  return { pasantias, empresas, stats }
}

export default async function Home() {
  const session = await auth()
  if (session?.user) redirect("/dashboard")

  const { pasantias, empresas, stats } = await getLandingData()
  const [totalEmpresas, totalAlumnos, totalPasantias, totalConvenios] = stats

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-white blur-3xl" />
          <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-primary-300 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Sparkles size={14} />
              Plataforma de gestión de pasantías
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">
              Encontrá tu próxima pasantía
            </h1>
            <p className="mt-4 text-lg text-blue-100">
              Conectamos estudiantes con empresas para impulsar su desarrollo profesional.
              Postulate con tu CV, seguí el estado y firmá el convenio en un solo lugar.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/pasantias">
                <Button size="lg" className="bg-white text-primary-700 shadow-lift hover:bg-blue-50">
                  <Search size={18} />
                  Buscar Pasantías
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 hover:border-white">
                  Crear cuenta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">
          <Stat numero={totalEmpresas} label="Empresas" />
          <Stat numero={totalAlumnos} label="Alumnos" />
          <Stat numero={totalPasantias} label="Pasantías" />
          <Stat numero={totalConvenios} label="Convenios firmados" />
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">¿Cómo funciona?</h2>
            <p className="mt-3 text-gray-500">Tres pasos simples para empezar tu experiencia profesional.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FeatureCard icon={<Search size={24} />} titulo="Buscá oportunidades" desc="Encontrá pasantías por área, modalidad y ubicación con filtros inteligentes." tone="primary" />
            <FeatureCard icon={<Users size={24} />} titulo="Postulate" desc="Aplicá con tu CV, certificados y seguí el estado de cada postulación." tone="success" />
            <FeatureCard icon={<Star size={24} />} titulo="Crece profesionalmente" desc="Firmá el convenio, cumplí tu plan de trabajo y recibí tu evaluación final." tone="warning" />
          </div>
        </div>
      </section>

      {/* Últimas pasantías */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">Últimas pasantías</h2>
              <p className="mt-1 text-sm text-gray-500">Oportunidades recientes publicadas por empresas.</p>
            </div>
            <Link href="/pasantias" className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700">
              Ver todas <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pasantias.map((p) => (
              <Link key={p.id} href={`/pasantias/${p.id}`}>
                <Card className="h-full cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
                  <CardContent className="pt-6">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <Badge>{p.area}</Badge>
                      <Badge variant="secondary" dot>{p.modalidad}</Badge>
                    </div>
                    <h3 className="mb-1 font-semibold text-gray-900">{p.titulo}</h3>
                    <p className="mb-3 text-sm text-gray-500">{p.empresa.nombre}</p>
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

      {/* Empresas participantes */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-2xl font-bold tracking-tight text-gray-900">Empresas participantes</h2>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {empresas.map((emp) => (
              <div key={emp.id} className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Building2 size={24} />
                </div>
                <p className="text-xs font-semibold text-gray-700">{emp.nombre}</p>
                <p className="text-[11px] text-gray-400">{emp._count.pasantias} pasantía{emp._count.pasantias !== 1 ? "s" : ""}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-primary-700 to-primary-500 px-8 py-14 text-center text-white shadow-lift">
            <Briefcase size={40} className="mx-auto mb-4 text-primary-200" />
            <h2 className="text-2xl font-bold sm:text-3xl">¿Listo para empezar?</h2>
            <p className="mx-auto mt-3 max-w-xl text-blue-100">
              {totalConvenios} convenios ya firmados entre alumnos, universidades y empresas. Sumate a la red.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-white text-primary-700 hover:bg-blue-50">
                  <FileSignature size={18} />
                  Registrarme gratis
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                  Iniciar sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function Stat({ numero, label }: { numero: number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-extrabold tracking-tight text-primary-600">{numero}</p>
      <p className="mt-1 text-sm font-medium text-gray-500">{label}</p>
    </div>
  )
}

function FeatureCard({ icon, titulo, desc, tone }: { icon: React.ReactNode; titulo: string; desc: string; tone: "primary" | "success" | "warning" }) {
  const tones = {
    primary: "bg-primary-50 text-primary-600",
    success: "bg-success-50 text-success-600",
    warning: "bg-warning-50 text-warning-600",
  }
  return (
    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <CardContent className="pt-6 text-center">
        <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${tones[tone]}`}>
          {icon}
        </div>
        <h3 className="mb-2 font-semibold text-gray-900">{titulo}</h3>
        <p className="text-sm text-gray-500">{desc}</p>
      </CardContent>
    </Card>
  )
}
