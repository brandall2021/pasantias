import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Building2, FileText, ClipboardList, Briefcase, FileCheck, GraduationCap } from "lucide-react"
import Link from "next/link"
import { UpdateProfileForm } from "./update-profile-form"
import { CambiarPasswordForm } from "./cambiar-password-form"

export default async function PerfilPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { empresa: true, universidad: true, carrera: true },
  })

  if (!user) redirect("/login")

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Mi Perfil</h1>
        <p className="mt-1 text-sm text-gray-500">Datos personales, historial y accesos de tu cuenta.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent>
          <UpdateProfileForm user={user} />
        </CardContent>
      </Card>

      {user.role === "ESTUDIANTE" && (user.habilidades || user.cvUrl || user.materiasAprobadas) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase size={20} />
              Historial laboral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.habilidades && (
              <div className="flex items-start gap-3">
                <FileCheck size={18} className="text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Habilidades</p>
                  <p className="text-sm whitespace-pre-wrap">{user.habilidades}</p>
                </div>
              </div>
            )}
            {user.cvUrl && (
              <div className="flex items-start gap-3">
                <FileText size={18} className="text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">URL de CV</p>
                  <a href={user.cvUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 underline break-all">
                    {user.cvUrl}
                  </a>
                </div>
              </div>
            )}
            {user.materiasAprobadas && (
              <div className="flex items-start gap-3">
                <GraduationCap size={18} className="text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Materias aprobadas</p>
                  <p className="text-sm whitespace-pre-wrap">{user.materiasAprobadas}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!user.image && (
        <div className="mt-6">
          <CambiarPasswordForm />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {user.role === "EMPRESA" && (
          <>
            <Link href="/perfil/pasantias">
              <Card className="cursor-pointer hover:shadow-card transition-all hover:-translate-y-0.5">
                <CardContent className="pt-6 flex items-center gap-3">
                  <Building2 size={24} className="text-primary-600" />
                  <div>
                    <h3 className="font-semibold">Mis Pasantías</h3>
                    <p className="text-sm text-gray-500">Gestionar publicaciones</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/perfil/postulaciones-recibidas">
              <Card className="cursor-pointer hover:shadow-card transition-all hover:-translate-y-0.5">
                <CardContent className="pt-6 flex items-center gap-3">
                  <ClipboardList size={24} className="text-warning-600" />
                  <div>
                    <h3 className="font-semibold">Postulaciones recibidas</h3>
                    <p className="text-sm text-gray-500">Revisar y gestionar postulaciones</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </>
        )}
        {user.role === "ESTUDIANTE" && (
          <>
            <Link href="/perfil/postulaciones">
              <Card className="cursor-pointer hover:shadow-card transition-all hover:-translate-y-0.5">
                <CardContent className="pt-6 flex items-center gap-3">
                  <User size={24} className="text-primary-600" />
                  <div>
                    <h3 className="font-semibold">Mis Postulaciones</h3>
                    <p className="text-sm text-gray-500">Ver estado de mis postulaciones</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/perfil/documentos">
              <Card className="cursor-pointer hover:shadow-card transition-all hover:-translate-y-0.5">
                <CardContent className="pt-6 flex items-center gap-3">
                  <FileText size={24} className="text-purple-600" />
                  <div>
                    <h3 className="font-semibold">Mis Documentos</h3>
                    <p className="text-sm text-gray-500">Analítico, título, certificados</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
