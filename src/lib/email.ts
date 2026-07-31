import nodemailer from "nodemailer"
import { config } from "@/lib/config"

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.secure,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
})

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!config.smtp.host) {
    console.warn("SMTP not configured, skipping email")
    return
  }

  try {
    await transporter.sendMail({
      from: config.smtp.from,
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error("Error sending email:", error)
  }
}

export function pasantiaNotificationEmail({
  titulo,
  descripcion,
  area,
  modalidad,
  duracion,
  becaEconomica,
  empresa,
}: {
  titulo: string
  descripcion: string
  area: string
  modalidad: string
  duracion?: string
  becaEconomica?: string
  empresa: string
}) {
  return {
    subject: `Nueva pasantía disponible: ${titulo}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a56db;">Nueva oportunidad de pasantía</h2>
        <p>La empresa <strong>${empresa}</strong> ha publicado una nueva pasantía:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Título</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${titulo}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Área</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${area}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Modalidad</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${modalidad}</td></tr>
          ${duracion ? `<tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Duración</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${duracion}</td></tr>` : ""}
          ${becaEconomica ? `<tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Beca</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${becaEconomica}</td></tr>` : ""}
        </table>
        <p style="color: #4b5563;">${descripcion}</p>
        <p>Los estudiantes interesados pueden postularse a través de la plataforma.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">Sistema de Pasantías</p>
      </div>
    `,
  }
}

export function postulacionEstadoEmail({
  nombre,
  pasantiaTitulo,
  empresaNombre,
  nuevoEstado,
}: {
  nombre: string
  pasantiaTitulo: string
  empresaNombre: string
  nuevoEstado: string
}) {
  const estadoLabels: Record<string, string> = {
    REVISADO: "revisada",
    ACEPTADO: "aceptada",
    RECHAZADO: "rechazada",
  }
  const label = estadoLabels[nuevoEstado] || nuevoEstado
  return {
    subject: `Postulación ${label}: ${pasantiaTitulo}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a56db;">Estado de tu postulación</h2>
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Tu postulación a la pasantía <strong>${pasantiaTitulo}</strong> en <strong>${empresaNombre}</strong> ha sido <strong>${label}</strong>.</p>
        <p>Ingresá a la plataforma para ver los detalles.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">Sistema de Pasantías</p>
      </div>
    `,
  }
}

export function resetPasswordEmail({ name, url }: { name: string; url: string }) {
  return {
    subject: "Recuperación de contraseña - Sistema de Pasantías",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a56db;">Recuperación de contraseña</h2>
        <p>Hola <strong>${name}</strong>,</p>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Hacé clic en el siguiente enlace para crear una nueva contraseña:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #1a56db; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Restablecer contraseña
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Este enlace expira en 1 hora.</p>
        <p style="color: #6b7280; font-size: 14px;">Si no solicitaste este cambio, ignorá este mensaje.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 12px; color: #9ca3af;">Sistema de Pasantías</p>
      </div>
    `,
  }
}
