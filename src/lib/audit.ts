import { prisma } from "./prisma"

export async function logAudit(
  usuarioId: string,
  accion: string,
  detalle?: string,
  ip?: string
) {
  try {
    await prisma.auditLog.create({
      data: { usuarioId, accion, detalle, ip },
    })
  } catch {
    // Silent fail - auditoria no debe romper la app
  }
}
