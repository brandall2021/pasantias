import { describe, it, expect, vi, beforeEach } from "vitest"
import { PlanTrabajoService } from "@/services/plan-trabajo.service"
import { PlanTrabajoRepository } from "@/repositories/planTrabajo.repository"
import { ConvenioRepository } from "@/repositories/convenio.repository"
import { crearNotificacion } from "@/lib/notificacion"

vi.mock("@/repositories/planTrabajo.repository", () => ({
  PlanTrabajoRepository: {
    create: vi.fn(),
    findUltimoPlan: vi.fn(),
    findRegistroDuplicado: vi.fn(),
    crearRegistroHoras: vi.fn(),
  },
}))

vi.mock("@/repositories/convenio.repository", () => ({
  ConvenioRepository: {
    findByIdConPostulacion: vi.fn(),
  },
}))

vi.mock("@/lib/notificacion", () => ({
  crearNotificacion: vi.fn(),
}))

const MockPlanRepo = vi.mocked(PlanTrabajoRepository)
const MockConvenioRepo = vi.mocked(ConvenioRepository)
const mockCrearNotificacion = vi.mocked(crearNotificacion)

describe("PlanTrabajoService.crear", () => {
  const base = {
    convenioId: "conv-1",
    objetivos: "Aprender desarrollo",
    horasSemana: 20,
    fechaInicio: new Date("2026-01-01T00:00:00"),
    fechaFin: new Date("2026-02-01T00:00:00"),
    usuarioId: "user-1",
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("crea el plan cuando los datos son válidos", async () => {
    MockPlanRepo.create.mockResolvedValue({ id: "plan-1" } as never)

    await PlanTrabajoService.crear(base)

    expect(MockPlanRepo.create).toHaveBeenCalledWith(base)
  })

  it("rechaza fecha de inicio posterior a la fecha de fin", async () => {
    await expect(
      PlanTrabajoService.crear({
        ...base,
        fechaInicio: new Date("2026-02-01T00:00:00"),
        fechaFin: new Date("2026-01-01T00:00:00"),
      })
    ).rejects.toThrow("La fecha de inicio debe ser anterior a la fecha de fin")
  })

  it("rechaza fecha de inicio igual a la fecha de fin", async () => {
    await expect(
      PlanTrabajoService.crear({
        ...base,
        fechaInicio: new Date("2026-01-01T00:00:00"),
        fechaFin: new Date("2026-01-01T00:00:00"),
      })
    ).rejects.toThrow("La fecha de inicio debe ser anterior a la fecha de fin")
  })

  it("rechaza horas semanales en 0", async () => {
    await expect(
      PlanTrabajoService.crear({ ...base, horasSemana: 0 })
    ).rejects.toThrow("Las horas semanales deben estar entre 1 y 40")
  })

  it("rechaza horas semanales negativas", async () => {
    await expect(
      PlanTrabajoService.crear({ ...base, horasSemana: -5 })
    ).rejects.toThrow("Las horas semanales deben estar entre 1 y 40")
  })

  it("rechaza horas semanales mayores a 40", async () => {
    await expect(
      PlanTrabajoService.crear({ ...base, horasSemana: 41 })
    ).rejects.toThrow("Las horas semanales deben estar entre 1 y 40")
  })

  it("acepta el límite de 40 horas semanales", async () => {
    MockPlanRepo.create.mockResolvedValue({ id: "plan-1" } as never)

    await PlanTrabajoService.crear({ ...base, horasSemana: 40 })

    expect(MockPlanRepo.create).toHaveBeenCalled()
  })

  it("no llama al repositorio cuando falla la validación", async () => {
    await expect(
      PlanTrabajoService.crear({ ...base, horasSemana: 99 })
    ).rejects.toThrow()

    expect(MockPlanRepo.create).not.toHaveBeenCalled()
  })
})

describe("PlanTrabajoService.registrarHoras", () => {
  const plan = {
    id: "plan-1",
    convenioId: "conv-1",
    fechaInicio: new Date("2026-01-01T00:00:00"),
    fechaFin: new Date("2026-01-31T00:00:00"),
  }

  const base = {
    convenioId: "conv-1",
    horas: 4,
    usuarioId: "user-1",
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("rechaza cuando no existe un plan de trabajo", async () => {
    MockPlanRepo.findUltimoPlan.mockResolvedValue(null as never)

    await expect(
      PlanTrabajoService.registrarHoras(base)
    ).rejects.toThrow("No existe un plan de trabajo para registrar horas")
  })

  it("rechaza registros con fecha anterior al inicio del plan", async () => {
    MockPlanRepo.findUltimoPlan.mockResolvedValue(plan as never)

    await expect(
      PlanTrabajoService.registrarHoras({
        ...base,
        fecha: new Date("2025-12-31T12:00:00"),
      })
    ).rejects.toThrow("La fecha del registro está fuera del rango del plan de trabajo")
  })

  it("rechaza registros con fecha posterior al fin del plan", async () => {
    MockPlanRepo.findUltimoPlan.mockResolvedValue(plan as never)

    await expect(
      PlanTrabajoService.registrarHoras({
        ...base,
        fecha: new Date("2026-02-01T12:00:00"),
      })
    ).rejects.toThrow("La fecha del registro está fuera del rango del plan de trabajo")
  })

  it("rechaza un segundo registro el mismo día (duplicado)", async () => {
    MockPlanRepo.findUltimoPlan.mockResolvedValue(plan as never)
    MockPlanRepo.findRegistroDuplicado.mockResolvedValue({ id: "reg-dup" } as never)

    await expect(
      PlanTrabajoService.registrarHoras({
        ...base,
        fecha: new Date("2026-01-15T12:00:00"),
      })
    ).rejects.toThrow("Ya registraste horas este día")
  })

  it("registra horas válidas dentro del rango sin duplicados", async () => {
    MockPlanRepo.findUltimoPlan.mockResolvedValue(plan as never)
    MockPlanRepo.findRegistroDuplicado.mockResolvedValue(null as never)
    MockPlanRepo.crearRegistroHoras.mockResolvedValue({ id: "reg-1", horas: 4 } as never)
    MockConvenioRepo.findByIdConPostulacion.mockResolvedValue(null as never)

    const registro = await PlanTrabajoService.registrarHoras({
      ...base,
      fecha: new Date("2026-01-15T12:00:00"),
    })

    expect(MockPlanRepo.crearRegistroHoras).toHaveBeenCalledWith(
      expect.objectContaining({ convenioId: "conv-1", horas: 4, usuarioId: "user-1" })
    )
    expect(registro).toEqual({ id: "reg-1", horas: 4 })
  })

  it("notifica a los tutores cuando el convenio tiene postulación", async () => {
    MockPlanRepo.findUltimoPlan.mockResolvedValue(plan as never)
    MockPlanRepo.findRegistroDuplicado.mockResolvedValue(null as never)
    MockPlanRepo.crearRegistroHoras.mockResolvedValue({ id: "reg-1" } as never)
    MockConvenioRepo.findByIdConPostulacion.mockResolvedValue({
      id: "conv-1",
      postulacion: {
        alumnoId: "alumno-1",
        tutorAcademicoId: "tutor-aca-1",
        tutorEmpresaId: null,
        pasantia: { titulo: "Pasantía de prueba" },
      },
    } as never)

    await PlanTrabajoService.registrarHoras({
      ...base,
      usuarioId: "alumno-1",
      fecha: new Date("2026-01-15T12:00:00"),
    })

    expect(mockCrearNotificacion).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: "tutor-aca-1", titulo: "Horas registradas" })
    )
    expect(mockCrearNotificacion).toHaveBeenCalledTimes(1)
  })
})
