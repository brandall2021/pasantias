import { AuditLogRepository } from "@/repositories/auditLog.repository"

export async function logAudit(
  usuarioId: string,
  accion: string,
  detalle?: string,
  tabla?: string,
  registroId?: string,
) {
  try {
    await AuditLogRepository.create({ usuarioId, accion, detalle, tabla, registroId })
  } catch (error) {
    console.error("Error logging audit:", error)
  }
}
