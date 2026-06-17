import { prisma } from "./prisma"

export async function logAudit(
  usuarioId: string,
  accion: string,
  detalle?: string,
  tabla?: string,
  registroId?: string,
) {
  try {
    await prisma.auditLog.create({
      data: { usuarioId, accion, detalle, tabla, registroId },
    })
  } catch (error) {
    console.error("Error logging audit:", error)
  }
}
