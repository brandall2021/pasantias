import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { BanUserButton } from "../ban-button"
import Link from "next/link"
import { ArrowLeft, Shield, Mail, Phone, Calendar, FileText, Building2 } from "lucide-react"

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login")

  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      empresa: true,
      universidad: true,
      carrera: { include: { facultad: { include: { universidad: true } } } },
      _count: { select: { postulaciones: true, documentos: true } },
    },
  })
  if (!user) redirect("/admin/usuarios")

  const auditoria = await prisma.auditLog.findMany({
    where: { usuarioId: id },
    orderBy: { fecha: "desc" },
    take: 50,
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/admin/usuarios" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-4">
        <ArrowLeft size={14} /> Volver a usuarios
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {user.name}
                <Badge variant={
                  user.role === "ADMIN" ? "destructive" :
                  user.role === "EMPRESA" ? "default" : "secondary"
                }>
                  {user.role === "ESTUDIANTE" ? "Estudiante" :
                   user.role === "EMPRESA" ? "Empresa" : "Admin"}
                </Badge>
                {user.baneado && <Badge variant="destructive">Baneado</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /> {user.email}</div>
              {user.phone && <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" /> {user.phone}</div>}
              <div className="flex items-center gap-2"><Calendar size={14} className="text-gray-400" /> Registro: {formatDate(user.createdAt)}</div>
              {user.dni && <div>DNI: {user.dni}</div>}
              {user.fechaNacimiento && <div>Fecha nac.: {formatDate(user.fechaNacimiento)}</div>}
              {user.direccion && <div>Dirección: {user.direccion}</div>}
              {user.carrera && <div className="flex items-center gap-2"><Building2 size={14} className="text-gray-400" /> {user.carrera.facultad.universidad.nombre} - {user.carrera.facultad.nombre} - {user.carrera.nombre}</div>}
              {user.legajo && <div>Legajo: {user.legajo}</div>}
              {user.anioCursada && <div>Año cursada: {user.anioCursada}</div>}
              {user.promedio && <div>Promedio: {user.promedio}</div>}
              {user.empresa && (
                <div className="flex items-center gap-2"><Building2 size={14} className="text-gray-400" /> Empresa: {user.empresa.nombre}</div>
              )}
              {user.universidad && (
                <div className="flex items-center gap-2"><Building2 size={14} className="text-blue-400" /> Universidad: {user.universidad.nombre}</div>
              )}
              <div className="flex items-center gap-2"><FileText size={14} className="text-gray-400" /> {user._count.postulaciones} postulaciones, {user._count.documentos} documentos</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Shield size={16} /> Historial de actividad</CardTitle>
            </CardHeader>
            <CardContent>
              {auditoria.length === 0 ? (
                <p className="text-sm text-gray-500">Sin registros de actividad</p>
              ) : (
                <div className="space-y-2">
                  {auditoria.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 text-sm border-b pb-2 last:border-0">
                      <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5">{formatDate(log.fecha)}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        log.accion === "LOGIN" ? "bg-blue-100 text-blue-700" :
                        log.accion === "REGISTRO" ? "bg-green-100 text-green-700" :
                        log.accion === "POSTULAR" ? "bg-purple-100 text-purple-700" :
                        log.accion === "CREAR_PASANTIA" ? "bg-teal-100 text-teal-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>{log.accion}</span>
                      <span className="text-gray-600">{log.detalle || "-"}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <BanUserButton userId={user.id} baneado={user.baneado} userName={user.name} />
              {user.motivoBaneo && (
                <p className="text-xs text-red-600">Motivo: {user.motivoBaneo}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
