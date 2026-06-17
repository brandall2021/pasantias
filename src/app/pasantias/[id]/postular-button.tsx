"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { FileText, CheckCircle2, AlertCircle } from "lucide-react"

interface Props {
  pasantiaId: string
  yaPostulado: boolean
  userId: string
}

const DOCS_REQUERIDOS = [
  { tipo: "CV", label: "Currículum Vitae (CV)" },
  { tipo: "ALUMNO_REGULAR", label: "Certificado de alumno regular" },
  { tipo: "ANALITICO_PARCIAL", label: "Certificado analítico parcial" },
  { tipo: "SALUD", label: "Certificado de salud psicofísica" },
]

export function PostularButton({ pasantiaId, yaPostulado }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [documentosPrevios, setDocumentosPrevios] = useState<any[]>([])
  const [docsForm, setDocsForm] = useState<Record<string, string>>({})
  const router = useRouter()

  useEffect(() => {
    fetch("/api/documentos")
      .then((res) => res.ok ? res.json() : [])
      .then((docs) => {
        setDocumentosPrevios(docs)
        const existentes: Record<string, string> = {}
        for (const doc of DOCS_REQUERIDOS) {
          const previo = docs.find((d: any) => d.tipo === doc.tipo)
          if (previo) existentes[doc.tipo] = previo.url
        }
        setDocsForm(existentes)
      })
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const documentos = DOCS_REQUERIDOS.map((doc) => ({
      tipo: doc.tipo,
      nombre: doc.label,
      url: docsForm[doc.tipo] || formData.get(`doc_${doc.tipo}`) as string,
    }))

    const faltantes = documentos.filter((d) => !d.url)
    if (faltantes.length > 0) {
      setError(`Completá todos los documentos obligatorios`)
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/postulaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pasantiaId,
          mensaje: formData.get("mensaje"),
          documentos,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        setError(err.error || "Error al postular")
        setLoading(false)
        return
      }

      setSuccess(true)
      router.refresh()
    } catch {
      setError("Error de conexión")
      setLoading(false)
    }
  }

  function handleDocChange(tipo: string, url: string) {
    setDocsForm((prev) => ({ ...prev, [tipo]: url }))
  }

  if (yaPostulado) {
    return <Button variant="secondary" disabled>Ya te postulaste</Button>
  }

  if (success) {
    return <Button variant="success" disabled>Postulación enviada ✓</Button>
  }

  if (!showForm) {
    return <Button onClick={() => setShowForm(true)}>Postularme</Button>
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="mensaje">Mensaje para la institución</Label>
            <Textarea id="mensaje" name="mensaje" placeholder="Contá por qué te interesa esta pasantía..." />
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <FileText size={16} />
              Documentación obligatoria
            </p>
            <div className="space-y-3">
              {DOCS_REQUERIDOS.map((doc) => {
                const tienePrevio = documentosPrevios.some((d: any) => d.tipo === doc.tipo)
                return (
                  <div key={doc.tipo}>
                    <Label htmlFor={`doc_${doc.tipo}`} className="flex items-center gap-2">
                      {tienePrevio && docsForm[doc.tipo] ? (
                        <CheckCircle2 size={14} className="text-green-500" />
                      ) : (
                        <AlertCircle size={14} className="text-amber-500" />
                      )}
                      {doc.label}
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id={`doc_${doc.tipo}`}
                        name={`doc_${doc.tipo}`}
                        value={docsForm[doc.tipo] || ""}
                        onChange={(e) => handleDocChange(doc.tipo, e.target.value)}
                        placeholder="https://drive.google.com/..."
                        required
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Postulación"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
