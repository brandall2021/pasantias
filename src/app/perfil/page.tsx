import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Mail, Building2, FileText, ClipboardList } from "lucide-react"
import Link from "next/link"
import { UpdateProfileForm } from "./update-profile-form"

export default async function PerfilPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { empresa: true, universidad: true, carrera: true },
  })

  if (!user) redirect("/login")

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>

      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent>
          <UpdateProfileForm user={user} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {user.role === "EMPRESA" && (
          <>
            <Link href="/perfil/pasantias">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="pt-6 flex items-center gap-3">
                  <Building2 size={24} className="text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Mis Pasantías</h3>
                    <p className="text-sm text-gray-500">Gestionar publicaciones</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/perfil/postulaciones-recibidas">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="pt-6 flex items-center gap-3">
                  <ClipboardList size={24} className="text-orange-600" />
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
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="pt-6 flex items-center gap-3">
                  <User size={24} className="text-blue-600" />
                  <div>
                    <h3 className="font-semibold">Mis Postulaciones</h3>
                    <p className="text-sm text-gray-500">Ver estado de mis postulaciones</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/perfil/documentos">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
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
