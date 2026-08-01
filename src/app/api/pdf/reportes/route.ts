import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import PDFDocument from "pdfkit"
import { UniversidadRepository } from "@/repositories/universidad.repository"
import { PasantiaRepository } from "@/repositories/pasantia.repository"
import { PostulacionRepository } from "@/repositories/postulacion.repository"

export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user.role !== "UNIVERSIDAD" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const universidadId = (session.user as { universidadId?: string }).universidadId
  if (!universidadId) return NextResponse.json({ error: "Sin universidad" }, { status: 400 })

  const facultadIds = (await UniversidadRepository.findFacultadesConNombre(universidadId))?.facultades || []

  const doc = new PDFDocument({ margin: 50, size: "A4" })
  const buffers: Buffer[] = []
  doc.on("data", (chunk: Buffer) => buffers.push(chunk))

  doc.fontSize(20).font("Helvetica-Bold").text("Reporte de Pasantías", { align: "center" })
  doc.moveDown(0.5)
  doc.fontSize(11).font("Helvetica").text(`Generado: ${new Date().toLocaleDateString("es-AR")}`, { align: "center" })
  doc.moveDown(1.5)

  for (const fac of facultadIds) {
    const pasantias = await PasantiaRepository.findByFacultadIds([fac.id])

    const activas = pasantias.filter((p) => p.estado === "ACTIVA" || p.estado === "PUBLICADA").length
    const finalizadas = pasantias.filter((p) => p.estado === "FINALIZADA").length

    doc.fontSize(14).font("Helvetica-Bold").text(fac.nombre)
    doc.fontSize(10).font("Helvetica")
    doc.text(`Total: ${pasantias.length} | Activas: ${activas} | Finalizadas: ${finalizadas}`)
    doc.moveDown(0.5)

    if (pasantias.length > 0) {
      for (const p of pasantias.slice(0, 10)) {
        doc.text(`  • ${p.titulo} — ${p.empresa.nombre} (${p.estado}) — ${p._count.postulaciones} post.`)
      }
      if (pasantias.length > 10) {
        doc.text(`  ... y ${pasantias.length - 10} más`)
      }
    }
    doc.moveDown(1)
  }

  doc.moveDown(2)
  doc.fontSize(10).font("Helvetica-Bold").text("Resumen General", { align: "center" })
  doc.moveDown(0.5)
  doc.fontSize(10).font("Helvetica")
  const totalPostulaciones = await PostulacionRepository.countByFacultadIds(facultadIds.map((f) => f.id))
  const totalPasantias = await PasantiaRepository.countByFacultadIds(facultadIds.map((f) => f.id))
  doc.text(`Total de pasantías: ${totalPasantias}`)
  doc.text(`Total de postulaciones: ${totalPostulaciones}`)

  doc.end()
  const pdf = Buffer.concat(buffers)

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="reporte-pasantias.pdf"',
    },
  })
}
