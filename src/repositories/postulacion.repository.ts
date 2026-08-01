import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export class PostulacionRepository {
  static findByPasantiaYAlumno(pasantiaId: string, alumnoId: string) {
    return prisma.postulacion.findUnique({
      where: { pasantiaId_alumnoId: { pasantiaId, alumnoId } },
    })
  }

  static findById(id: string) {
    return prisma.postulacion.findUnique({ where: { id } })
  }

  static findByIdConPasantia(id: string) {
    return prisma.postulacion.findUnique({
      where: { id },
      include: {
        pasantia: {
          include: { empresa: { select: { id: true } } },
          select: {
            titulo: true,
            vacantes: true,
            empresaId: true,
            estado: true,
            empresa: { select: { id: true } },
          },
        },
        alumno: { select: { id: true } },
      },
    })
  }

  static findByIdConDetalle(id: string) {
    return prisma.postulacion.findUnique({
      where: { id },
      include: {
        alumno: { select: { name: true, email: true } },
        pasantia: { select: { titulo: true, empresa: { select: { nombre: true } } } },
      },
    })
  }

  static findByIdParaConvenio(id: string) {
    return prisma.postulacion.findUnique({
      where: { id },
      include: {
        alumno: { select: { name: true, dni: true } },
        pasantia: {
          select: {
            titulo: true,
            descripcion: true,
            area: true,
            modalidad: true,
            duracion: true,
            empresa: { select: { nombre: true, cuit: true } },
          },
        },
        tutorAcademico: { select: { name: true } },
        tutorEmpresa: { select: { name: true } },
        convenio: true,
      },
    })
  }

  static findByIdParaCarta(id: string) {
    return prisma.postulacion.findUnique({
      where: { id },
      include: {
        alumno: { select: { name: true, dni: true } },
        pasantia: { select: { titulo: true, empresa: { select: { nombre: true } } } },
      },
    })
  }

  static findByIdParaSeguro(id: string) {
    return prisma.postulacion.findUnique({
      where: { id },
      include: {
        pasantia: { select: { titulo: true } },
        alumno: { select: { id: true } },
      },
    })
  }

  static findByIdConPasantiaTitulo(id: string) {
    return prisma.postulacion.findUnique({
      where: { id },
      select: { pasantia: { select: { titulo: true } } },
    })
  }

  static findByIdConUnidadAcademica(id: string) {
    return prisma.postulacion.findUnique({
      where: { id },
      select: {
        pasantia: {
          select: {
            unidadAcademica: {
              select: { universidad: { select: { id: true } } },
            },
          },
        },
      },
    })
  }

  static findByIdConPasantiaEmpresa(id: string) {
    return prisma.postulacion.findUnique({
      where: { id },
      include: {
        pasantia: { select: { titulo: true, empresaId: true } },
        alumno: { select: { id: true } },
      },
    })
  }

  static create(data: Prisma.PostulacionUncheckedCreateInput) {
    return prisma.postulacion.create({ data })
  }

  static update<T extends Prisma.PostulacionInclude>(
    id: string,
    data: Prisma.PostulacionUncheckedUpdateInput,
    include?: T,
  ) {
    return prisma.postulacion.update({ where: { id }, data, include })
  }

  static findByAlumnoId(alumnoId: string, pasantiaId?: string) {
    return prisma.postulacion.findMany({
      where: { alumnoId, ...(pasantiaId ? { pasantiaId } : {}) },
      include: {
        pasantia: {
          select: { id: true, titulo: true, area: true, modalidad: true, estado: true },
        },
        convenio: true,
      },
      orderBy: { fecha: "desc" },
    })
  }

  static findByEmpresaId(empresaId: string, pasantiaId?: string) {
    const where: Prisma.PostulacionWhereInput = pasantiaId ? { pasantiaId } : {}
    where.pasantia = { empresaId }
    return prisma.postulacion.findMany({
      where,
      include: {
        alumno: { select: { name: true, email: true } },
        pasantia: { select: { titulo: true } },
        convenio: true,
      },
      orderBy: { fecha: "desc" },
    })
  }

  static findByPasantiaId(pasantiaId?: string) {
    return prisma.postulacion.findMany({
      where: pasantiaId ? { pasantiaId } : {},
      include: {
        alumno: { select: { name: true, email: true } },
        pasantia: { select: { titulo: true } },
        convenio: true,
      },
      orderBy: { fecha: "desc" },
    })
  }

  static findAceptadasConConvenio(pasantiaId: string) {
    return prisma.postulacion.findMany({
      where: { pasantiaId, estado: "ACEPTADO" },
      include: { convenio: true, seguro: true },
    })
  }

  static countAceptadas(pasantiaId: string) {
    return prisma.postulacion.count({
      where: { pasantiaId, estado: "ACEPTADO" },
    })
  }

  static findExportables(facultadIds: string[] | undefined) {
    const where: Prisma.PostulacionWhereInput = facultadIds
      ? { pasantia: { unidadAcademicaId: { in: facultadIds } } }
      : {}
    return prisma.postulacion.findMany({
      where,
      include: {
        alumno: { select: { name: true, email: true } },
        pasantia: { select: { titulo: true, empresa: { select: { nombre: true } } } },
      },
      orderBy: { fecha: "desc" },
    })
  }

  static countByFacultadIds(facultadIds: string[]) {
    return prisma.postulacion.count({
      where: { pasantia: { unidadAcademicaId: { in: facultadIds } } },
    })
  }
}
