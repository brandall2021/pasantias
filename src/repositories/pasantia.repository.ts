import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export class PasantiaRepository {
  static findById(id: string) {
    return prisma.pasantia.findUnique({
      where: { id },
      include: {
        empresa: { select: { nombre: true, logo: true } },
        postulaciones: {
          include: {
            alumno: { select: { name: true, email: true } },
            convenio: true,
          },
        },
      },
    })
  }

  static findByIdSimple(id: string) {
    return prisma.pasantia.findUnique({ where: { id } })
  }

  static findByIdConEmpresa(id: string) {
    return prisma.pasantia.findUnique({
      where: { id },
      include: { empresa: { select: { id: true } } },
    })
  }

  static findByIdConDetalle(id: string) {
    return prisma.pasantia.findUnique({
      where: { id },
      include: {
        empresa: { select: { nombre: true, logo: true } },
        postulaciones: { include: { alumno: { select: { name: true } } } },
      },
    })
  }

  static findByIdConUniversidad(id: string) {
    return prisma.pasantia.findUnique({
      where: { id },
      include: {
        unidadAcademica: { select: { universidad: { select: { nombre: true } } } },
      },
    })
  }

  static findByIdSelectEstado(id: string) {
    return prisma.pasantia.findUnique({
      where: { id },
      select: { estado: true, titulo: true },
    })
  }

  static create(data: Prisma.PasantiaUncheckedCreateInput, include?: Prisma.PasantiaInclude) {
    return prisma.pasantia.create({ data, include })
  }

  static createConDetalle(data: Prisma.PasantiaUncheckedCreateInput) {
    return prisma.pasantia.create({
      data,
      include: {
        empresa: { select: { nombre: true, email: true } },
        unidadAcademica: {
          select: { nombre: true, universidad: { select: { nombre: true, email: true } } },
        },
      },
    })
  }

  static update(id: string, data: Prisma.PasantiaUncheckedUpdateInput) {
    return prisma.pasantia.update({ where: { id }, data })
  }

  static findPublicadas() {
    return prisma.pasantia.findMany({
      where: { estado: "PUBLICADA", activo: true },
      include: {
        empresa: { select: { nombre: true } },
        _count: { select: { postulaciones: true } },
      },
      orderBy: { createdAt: "desc" },
    })
  }

  static findByFacultadIds(facultadIds: string[]) {
    return prisma.pasantia.findMany({
      where: { unidadAcademicaId: { in: facultadIds } },
      include: {
        empresa: { select: { nombre: true } },
        _count: { select: { postulaciones: true } },
      },
    })
  }

  static findExportables(facultadIds: string[] | undefined) {
    const where: Prisma.PasantiaWhereInput = facultadIds
      ? { unidadAcademicaId: { in: facultadIds } }
      : {}
    return prisma.pasantia.findMany({
      where,
      include: {
        empresa: { select: { nombre: true } },
        unidadAcademica: { select: { nombre: true } },
      },
      orderBy: { createdAt: "desc" },
    })
  }

  static countByFacultadIds(facultadIds: string[]) {
    return prisma.pasantia.count({ where: { unidadAcademicaId: { in: facultadIds } } })
  }
}
