import { describe, it, expect, vi, beforeEach } from "vitest"
import { PATCH } from "@/app/api/postulaciones/route"
import { PostulacionRepository } from "@/repositories/postulacion.repository"
import { sendEmail } from "@/lib/email"
import { logAudit } from "@/lib/audit"

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}))

vi.mock("@/repositories/postulacion.repository", () => ({
  PostulacionRepository: {
    findByIdConPasantia: vi.fn(),
    countAceptadas: vi.fn(),
    update: vi.fn(),
    findByAlumnoId: vi.fn(),
    findByEmpresaId: vi.fn(),
    findByPasantiaId: vi.fn(),
  },
}))

vi.mock("@/repositories/pasantia.repository", () => ({
  PasantiaRepository: { findByIdSimple: vi.fn() },
}))

vi.mock("@/repositories/documento.repository", () => ({
  DocumentoRepository: { createMany: vi.fn() },
}))

vi.mock("@/repositories/conversacion.repository", () => ({
  ConversacionRepository: { create: vi.fn() },
}))

vi.mock("@/repositories/user.repository", () => ({
  UserRepository: { findIdPorEmpresa: vi.fn() },
}))

vi.mock("@/lib/email", () => ({
  sendEmail: vi.fn(),
  postulacionEstadoEmail: vi.fn(() => ({ subject: "", html: "" })),
}))

vi.mock("@/lib/audit", () => ({
  logAudit: vi.fn(),
}))

vi.mock("@/lib/notificacion", () => ({
  crearNotificacion: vi.fn(),
}))

import { auth } from "@/lib/auth"

const mockAuth = vi.mocked(auth)
const MockPostulacionRepo = vi.mocked(PostulacionRepository)
const mockSendEmail = vi.mocked(sendEmail)
const mockLogAudit = vi.mocked(logAudit)

function jsonResponse(res: Response) {
  return res.json()
}

function postulacion(id: string) {
  return {
    id,
    alumnoId: "alumno-1",
    pasantia: {
      titulo: "Pasantía de prueba",
      empresaId: "empresa-1",
      empresa: { nombre: "Empresa Test" },
      vacantes: 2,
    },
  }
}

const sessionEmpresa = {
  user: {
    id: "user-empresa",
    name: "Empresa Test",
    email: "empresa@test.com",
    role: "EMPRESA",
    empresaId: "empresa-1",
  },
}

describe("PATCH /api/postulaciones — cupo de vacantes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("rechaza con 401 si no hay sesión", async () => {
    mockAuth.mockResolvedValue(null as never)

    const res = await PATCH(new Request("http://localhost/api/postulaciones", {
      method: "PATCH",
      body: JSON.stringify({ id: "post-1", estado: "ACEPTADO" }),
    }))

    expect(res.status).toBe(401)
  })

  it("rechaza con 401 si el usuario no es de la empresa ni admin", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "u-otro", name: "Otro", email: "o@t.com", role: "ESTUDIANTE" },
    } as never)
    MockPostulacionRepo.findByIdConPasantia.mockResolvedValue(postulacion("post-1") as never)

    const res = await PATCH(new Request("http://localhost/api/postulaciones", {
      method: "PATCH",
      body: JSON.stringify({ id: "post-1", estado: "ACEPTADO" }),
    }))

    expect(res.status).toBe(401)
  })

  it("rechaza aceptar cuando las vacantes están cubiertas", async () => {
    mockAuth.mockResolvedValue(sessionEmpresa as never)
    MockPostulacionRepo.findByIdConPasantia.mockResolvedValue(postulacion("post-1") as never)
    MockPostulacionRepo.countAceptadas.mockResolvedValue(2)

    const res = await PATCH(new Request("http://localhost/api/postulaciones", {
      method: "PATCH",
      body: JSON.stringify({ id: "post-1", estado: "ACEPTADO" }),
    }))

    expect(res.status).toBe(400)
    const body = await jsonResponse(res)
    expect(body.error).toContain("Vacantes cubiertas")
    expect(MockPostulacionRepo.update).not.toHaveBeenCalled()
  })

  it("acepta cuando hay cupo disponible", async () => {
    mockAuth.mockResolvedValue(sessionEmpresa as never)
    MockPostulacionRepo.findByIdConPasantia.mockResolvedValue(postulacion("post-1") as never)
    MockPostulacionRepo.countAceptadas.mockResolvedValue(1)
    MockPostulacionRepo.update.mockResolvedValue({
      id: "post-1",
      alumnoId: "alumno-1",
      alumno: { name: "Alumno", email: "alumno@test.com" },
      pasantia: { titulo: "Pasantía de prueba", empresa: { nombre: "Empresa Test" } },
    } as never)

    const res = await PATCH(new Request("http://localhost/api/postulaciones", {
      method: "PATCH",
      body: JSON.stringify({ id: "post-1", estado: "ACEPTADO" }),
    }))

    expect(res.status).toBe(200)
    expect(MockPostulacionRepo.update).toHaveBeenCalledWith(
      "post-1",
      expect.objectContaining({ estado: "ACEPTADO" }),
      expect.any(Object)
    )
    expect(mockSendEmail).toHaveBeenCalled()
    expect(mockLogAudit).toHaveBeenCalled()
  })

  it("acepta hasta el límite exacto de vacantes (count == vacantes)", async () => {
    mockAuth.mockResolvedValue(sessionEmpresa as never)
    MockPostulacionRepo.findByIdConPasantia.mockResolvedValue(postulacion("post-1") as never)
    MockPostulacionRepo.countAceptadas.mockResolvedValue(2)
    MockPostulacionRepo.update.mockResolvedValue({ id: "post-1" } as never)

    // vacantes = 2 y ya hay 2 aceptadas → cubiertas
    const res = await PATCH(new Request("http://localhost/api/postulaciones", {
      method: "PATCH",
      body: JSON.stringify({ id: "post-1", estado: "ACEPTADO" }),
    }))

    expect(res.status).toBe(400)
    expect(MockPostulacionRepo.update).not.toHaveBeenCalled()
  })
})
