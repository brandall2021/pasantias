"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Trash2, ExternalLink, Plus } from "lucide-react"

interface Documento {
  id: string
  nombre: string
  tipo: string
  url: string
  createdAt: string
}

const TIPOS = [
  { value: "CV", label: "Currículum Vitae" },
  { value: "ALUMNO_REGULAR", label: "Certificado de alumno regular" },
  { value: "ANALITICO_PARCIAL", label: "Certificado analítico parcial" },
  { value: "SALUD", label: "Certificado de salud psicofísica" },
  { value: "OTRO", label: "Otro" },
]

const TIPO_COLORS: Record<string, string> = {
  CV: "bg-blue-100 text-blue-800",
  ALUMNO_REGULAR: "bg-green-100 text-green-800",
  ANALITICO_PARCIAL: "bg-purple-100 text-purple-800",
  SALUD: "bg-teal-100 text-teal-800",
  OTRO: "bg-gray-100 text-gray-800",
}

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetch("/api/documentos")
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(setDocumentos)
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false))
  }, [router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      const res = await fetch("/api/documentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Error al guardar")
        setSaving(false)
        return
      }

      const nuevo = await res.json()
      setDocumentos((prev) => [nuevo, ...prev])
      setShowForm(false)
      setSaving(false)
    } catch {
      setError("Error de conexión")
      setSaving(false)
    }
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar este documento?")) return
    const res = await fetch(`/api/documentos/${id}`, { method: "DELETE" })
    if (res.ok) setDocumentos((prev) => prev.filter((d) => d.id !== id))
  }

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8"><p className="text-gray-500">Cargando...</p></div>

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mis Documentos</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="mr-1" />
          {showForm ? "Cancelar" : "Agregar"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>}

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del documento</Label>
                <Input id="nombre" name="nombre" required placeholder="Ej: Analítico 2024" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select id="tipo" name="tipo" required>
                  <option value="">Seleccionar...</option>
                  {TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">Link de Google Drive</Label>
                <Input id="url" name="url" required placeholder="https://drive.google.com/file/d/..." />
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar Documento"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {documentos.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500 py-12">
            <FileText size={48} className="mx-auto mb-3 text-gray-300" />
            <p>No tenés documentos cargados</p>
            <p className="text-sm">Agregá tu CV, certificado de alumno regular, analítico parcial, etc.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {documentos.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="pt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-gray-400" />
                  <div>
                    <p className="font-medium">{doc.nombre}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${TIPO_COLORS[doc.tipo] || TIPO_COLORS.OTRO}`}>
                        {TIPOS.find((t) => t.value === doc.tipo)?.label || doc.tipo}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" title="Abrir">
                      <ExternalLink size={16} />
                    </Button>
                  </a>
                  <Button variant="ghost" size="icon" onClick={() => eliminar(doc.id)} title="Eliminar">
                    <Trash2 size={16} className="text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
