import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export class AuditLogRepository {
  static create(data: Prisma.AuditLogUncheckedCreateInput) {
    return prisma.auditLog.create({ data })
  }

  static findMany(where: Prisma.AuditLogWhereInput, limit: number, offset: number) {
    return prisma.auditLog.findMany({
      where,
      include: { usuario: { select: { name: true, email: true, role: true } } },
      orderBy: { fecha: "desc" },
      take: limit,
      skip: offset,
    })
  }

  static count(where: Prisma.AuditLogWhereInput) {
    return prisma.auditLog.count({ where })
  }
}
