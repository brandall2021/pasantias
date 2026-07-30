"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface UserOption {
  id: string
  name: string
}

export function AsignarTutor({
  postulacionId,
  tipo,
  tutorActualId,
  label,
}: {
  postulacionId: string
  tipo: "tutorAcademicoId" | "tutorEmpresaId"
  tutorActualId?: string | null
  label: string
}) {
  const router = useRouter()
  const [tutores, setTutores] = useState<UserOption[]>([])
  const [selectedId, setSelectedId] = useState(tutorActualId || "")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const role = tipo === "tutorAcademicoId" ? "TUTOR_ACADEMICO" : "TUTOR_EMPRESA"
    fetch(`/api/users?role=${role}`)
      .then((r) => r.json())
      .then((data) => setTutores(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [tipo])

  async function handleAssign() {
    if (!selectedId) return
    setSaving(true)
    const res = await fetch(`/api/postulaciones`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: postulacionId, [tipo]: selectedId }),
    })
    if (res.ok) router.refresh()
    setSaving(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedId(e.target.value)}>
        <option value="">{label}</option>
        {tutores.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </Select>
      {selectedId && selectedId !== tutorActualId && (
        <Button size="sm" className="text-xs h-7" onClick={handleAssign} disabled={saving}>
          {saving ? "..." : "Asignar"}
        </Button>
      )}
    </div>
  )
}
