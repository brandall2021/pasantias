import { describe, it, expect, vi, beforeEach } from "vitest"
import { PasantiaService } from "@/services/pasantia.service"
import { PasantiaRepository } from "@/repositories/pasantia.repository"
import { PostulacionRepository } from "@/repositories/postulacion.repository"
import { logAudit } from "@/lib/audit"

vi.mock("@/repositories/pasantia.repository", () => ({
  PasantiaRepository: {
    createConDetalle: vi.fn(),
    findByIdSelectEstado: vi.fn(),
    update: vi.fn(),
    findPublicadas: vi.fn(),
    findByIdConDetalle: vi.fn(),
  },
}))

vi.mock("@/repositories/postulacion.repository", () => ({
  PostulacionRepository: {
    findAceptadasConConvenio: vi.fn(),
  },
}))

vi.mock("@/lib/audit", () => ({
  logAudit: vi.fn(),
}))

vi.mock("@/lib/email", () => ({
  sendEmail: vi.fn(),
  pasantiaNotificationEmail: vi.fn(() => ({ subject: "", html: "" })),
}))

const MockPasantiaRepo = vi.mocked(PasantiaRepository)
const MockPostulacionRepo = vi.mocked(PostulacionRepository)
const mockLogAudit = vi.mocked(logAudit)

describe("PasantiaService.cambiarEstado", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("rechaza transiciones no permitidas", async () => {
    MockPasantiaRepo.findByIdSelectEstado.mockResolvedValue({
      id: "p-1",
      titulo: "Pasantía",
      estado: "PUBLICADA",
    } as never)

    await expect(
      PasantiaService.cambiarEstado("p-1", "ACTIVA", "user-1")
    ).rejects.toThrow("No se puede cambiar de PUBLICADA a ACTIVA")
  })

  it("rechaza publicar si el rol no es empresa ni admin", async () => {
    MockPasantiaRepo.findByIdSelectEstado.mockResolvedValue({
      id: "p-1",
      titulo: "Pasantía",
      estado: "BORRADOR",
    } as never)

    await expect(
      PasantiaService.cambiarEstado("p-1", "PUBLICADA", "user-1", { role: "ESTUDIANTE" })
    ).rejects.toThrow("Solo la empresa o admin pueden publicar pasantías")
  })

  describe("transición a ACTIVA", () => {
    const convenioCompleto = {
      firmaAlumno: true,
      firmaEmpresa: true,
      firmaUniversidad: true,
    }
    const seguroVigente = {
      coberturaHasta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }

    beforeEach(() => {
      MockPasantiaRepo.findByIdSelectEstado.mockResolvedValue({
        id: "p-1",
        titulo: "Pasantía",
        estado: "ESPERA_CONVENIO",
      } as never)
    })

    it("rechaza cuando no hay postulaciones aceptadas", async () => {
      MockPostulacionRepo.findAceptadasConConvenio.mockResolvedValue([] as never)

      await expect(
        PasantiaService.cambiarEstado("p-1", "ACTIVA", "user-1")
      ).rejects.toThrow("No hay postulaciones aceptadas para esta pasantía")
    })

    it("rechaza si el convenio no tiene las 3 firmas", async () => {
      MockPostulacionRepo.findAceptadasConConvenio.mockResolvedValue([
        {
          id: "post-1",
          convenio: { ...convenioCompleto, firmaUniversidad: false },
          seguro: seguroVigente,
        },
      ] as never)

      await expect(
        PasantiaService.cambiarEstado("p-1", "ACTIVA", "user-1")
      ).rejects.toThrow("Hay postulaciones aceptadas sin convenio tripartito completado")
    })

    it("rechaza si no hay seguro cargado", async () => {
      MockPostulacionRepo.findAceptadasConConvenio.mockResolvedValue([
        {
          id: "post-1",
          convenio: convenioCompleto,
          seguro: null,
        },
      ] as never)

      await expect(
        PasantiaService.cambiarEstado("p-1", "ACTIVA", "user-1")
      ).rejects.toThrow("Hay postulaciones aceptadas sin seguro de pasantía cargado")
    })

    it("rechaza si el seguro está vencido", async () => {
      MockPostulacionRepo.findAceptadasConConvenio.mockResolvedValue([
        {
          id: "post-1",
          convenio: convenioCompleto,
          seguro: { coberturaHasta: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        },
      ] as never)

      await expect(
        PasantiaService.cambiarEstado("p-1", "ACTIVA", "user-1")
      ).rejects.toThrow("Hay un seguro de pasantía vencido. Renovalo antes de activar")
    })

    it("activa la pasantía cuando todo está en regla", async () => {
      MockPostulacionRepo.findAceptadasConConvenio.mockResolvedValue([
        {
          id: "post-1",
          convenio: convenioCompleto,
          seguro: seguroVigente,
        },
      ] as never)
      MockPasantiaRepo.update.mockResolvedValue({ id: "p-1", estado: "ACTIVA" } as never)

      const result = await PasantiaService.cambiarEstado("p-1", "ACTIVA", "user-1")

      expect(MockPasantiaRepo.update).toHaveBeenCalledWith("p-1", { estado: "ACTIVA" })
      expect(result).toEqual({ id: "p-1", estado: "ACTIVA" })
      expect(mockLogAudit).toHaveBeenCalled()
    })
  })
})
