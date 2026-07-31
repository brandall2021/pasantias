import PDFDocument from "pdfkit"

interface ConvenioData {
  alumno: string
  alumnoDni: string
  empresa: string
  empresaCuit: string
  universidad: string
  pasantiaTitulo: string
  pasantiaDescripcion: string
  pasantiaArea: string
  pasantiaModalidad: string
  pasantiaDuracion: string
  tutorAcademico?: string | null
  tutorEmpresa?: string | null
  fechaInicio?: string | null
}

export function generarConvenioPDF(data: ConvenioData): Buffer {
  const doc = new PDFDocument({ margin: 50, size: "A4" })
  const buffers: Buffer[] = []

  doc.on("data", (chunk: Buffer) => buffers.push(chunk))

  const pageWidth = doc.page.width - 100

  // Header
  doc.fontSize(18).font("Helvetica-Bold").text("CONVENIO TRIPARTITO DE PRÁCTICA PROFESIONAL", { align: "center" })
  doc.moveDown(0.5)
  doc.fontSize(10).font("Helvetica").text(`Entre: ${data.universidad}, ${data.empresa} y ${data.alumno}`, { align: "center" })
  doc.moveDown(1.5)

  // Line
  doc.moveTo(50, doc.y).lineTo(pageWidth + 50, doc.y).stroke()
  doc.moveDown(1.5)

  // Cláusulas
  const clausulas = [
    {
      title: "PRIMERA: PARTES INTERVINIENTES",
      text: `Son partes del presente convenio: a) ${data.universidad}, con domicilio en la ciudad de su asiento principal; b) ${data.empresa}, CUIT ${data.empresaCuit}; c) ${data.alumno}, DNI ${data.alumnoDni}.`,
    },
    {
      title: "SEGUNDA: OBJETO",
      text: `El presente convenio tiene por objeto que ${data.alumno} realice una práctica profesional en ${data.empresa}, en el área de ${data.pasantiaArea}, bajo la modalidad ${data.pasantiaModalidad}, con una duración de ${data.pasantiaDuracion}.`,
    },
    {
      title: "TERCERA: DESCRIPCIÓN DE LA PASANTÍA",
      text: data.pasantiaDescripcion,
    },
    {
      title: "CUARTA: TUTORES",
      text: `La Universidad designa como tutor académico a ${data.tutorAcademico || "a designar"}. La Empresa designa como tutor empresarial a ${data.tutorEmpresa || "a designar"}.`,
    },
    {
      title: "QUINTA: RÉGIMEN LABORAL",
      text: "La práctica profesional no genera relación laboral entre las partes. El estudiante no percibirá remuneración salarial, sin perjuicio de la beca económica que la empresa pudiera otorgar.",
    },
    {
      title: "SEXTA: VIGENCIA",
      text: `El presente convenio entrará en vigencia a partir de la fecha de su firma por todas las partes y se extenderá por el plazo acordado.${data.fechaInicio ? ` Fecha de inicio estimada: ${data.fechaInicio}.` : ""}`,
    },
    {
      title: "SÉPTIMA: CONFIDENCIALIDAD",
      text: `${data.alumno} se compromete a mantener confidencialidad sobre toda la información sensible de ${data.empresa} a la que tenga acceso durante la práctica profesional.`,
    },
    {
      title: "OCTAVA: SEGURO",
      text: "La Universidad gestionará el seguro correspondiente para cubrir los riesgos de la práctica profesional, de acuerdo a la normativa vigente.",
    },
  ]

  for (const c of clausulas) {
    doc.fontSize(10).font("Helvetica-Bold").text(c.title)
    doc.fontSize(9).font("Helvetica").text(c.text, { align: "justify" })
    doc.moveDown(1)
  }

  // Firmas
  doc.moveDown(2)
  doc.fontSize(10).font("Helvetica-Bold").text("FIRMAS", { align: "center" })
  doc.moveDown(2)

  const firmaY = doc.y
  const colWidth = (pageWidth) / 3

  for (let i = 0; i < 3; i++) {
    const x = 50 + i * colWidth
    doc.moveTo(x, firmaY).lineTo(x + colWidth - 20, firmaY).stroke()
    doc.fontSize(9).font("Helvetica").text(
      ["Por la Empresa", "", "Por la Universidad", "", "Por el Alumno"][i],
      x, firmaY + 10, { width: colWidth - 20, align: "center" }
    )
  }

  doc.end()

  return Buffer.concat(buffers)
}

interface CartaData {
  alumno: string
  alumnoDni: string
  empresa: string
  universidad: string
  pasantiaTitulo: string
  tipo: "presentacion" | "aceptacion"
  fecha: string
}

export function generarCartaPDF(data: CartaData): Buffer {
  const doc = new PDFDocument({ margin: 50, size: "A4" })
  const buffers: Buffer[] = []

  doc.on("data", (chunk: Buffer) => buffers.push(chunk))

  const titulo = data.tipo === "presentacion" ? "CARTA DE PRESENTACIÓN" : "CARTA DE ACEPTACIÓN"

  doc.fontSize(16).font("Helvetica-Bold").text(titulo, { align: "center" })
  doc.moveDown(2)
  doc.fontSize(10).font("Helvetica").text(`${data.universidad}`, { align: "right" })
  doc.text(`${data.fecha}`, { align: "right" })
  doc.moveDown(2)

  doc.text(`A quien corresponda:`, { align: "left" })
  doc.moveDown(1)

  if (data.tipo === "presentacion") {
    doc.text(`Por medio de la presente, ${data.universidad} presenta a ${data.alumno}, DNI ${data.alumnoDni}, alumno regular de esta casa de estudios, para realizar la práctica profesional "${data.pasantiaTitulo}" en ${data.empresa}.`, { align: "justify" })
  } else {
    doc.text(`${data.empresa} acepta al alumno ${data.alumno}, DNI ${data.alumnoDni}, para realizar la práctica profesional "${data.pasantiaTitulo}" en el marco del convenio de cooperación educativa.`, { align: "justify" })
  }

  doc.moveDown(2)
  doc.text("Sin otro particular, saludo atte.", { align: "left" })
  doc.moveDown(3)
  doc.moveTo(50, doc.y).lineTo(300, doc.y).stroke()
  doc.moveDown(0.5)
  doc.fontSize(9).text(`${data.universidad}`, 50, doc.y)

  doc.end()
  return Buffer.concat(buffers)
}
