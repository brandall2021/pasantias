import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
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
  if (!process.env.SMTP_HOST) {
    console.warn("SMTP not configured, skipping email")
    return
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@pasantias.com",
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
