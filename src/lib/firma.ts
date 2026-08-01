import { createHash } from "crypto"

export function generarFirmaElectronica({
  convenioId,
  postulacionId,
  pasantiaTitulo,
  parte,
  usuarioId,
  usuarioNombre,
}: {
  convenioId: string
  postulacionId: string
  pasantiaTitulo: string
  parte: "alumno" | "empresa" | "universidad"
  usuarioId: string
  usuarioNombre: string
}) {
  const timestamp = new Date().toISOString()
  const raw = [
    convenioId,
    postulacionId,
    pasantiaTitulo,
    parte,
    usuarioId,
    usuarioNombre,
    timestamp,
  ].join("|")

  return {
    hash: createHash("sha256").update(raw).digest("hex"),
    fecha: new Date(timestamp),
  }
}
