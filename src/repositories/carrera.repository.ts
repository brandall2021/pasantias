import { prisma } from "@/lib/prisma"

export class CarreraRepository {
  static findAll(facultadId?: string) {
    return prisma.carrera.findMany({
      where: facultadId ? { facultadId } : {},
      include: {
        facultad: { select: { nombre: true, universidad: { select: { nombre: true } } } },
      },
      orderBy: { nombre: "asc" },
    })
  }
}
