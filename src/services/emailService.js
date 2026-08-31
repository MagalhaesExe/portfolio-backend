import { Resend } from 'resend'
import { env } from '../config/env.js'

const resend = new Resend(env.RESEND_API_KEY)

// Remetente padrão do Resend, válido sem verificar domínio próprio
const FROM_ADDRESS = 'Portfolio Alex <onboarding@resend.dev>'

export const sendConfirmationEmail = async (to, name) => {
  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: 'Mensagem recebida - Portfolio Alex',
    html: `
      <h2>Obrigado, ${name}!</h2>
      <p>Recebemos sua mensagem e vamos responder em breve.</p>
      <p>Abraços,<br>Alex Magalhães</p>
    `
  })
}

export const sendNotificationEmail = async (contact) => {
  await resend.emails.send({
    from: FROM_ADDRESS,
    to: env.EMAIL_USER,
    subject: `Novo contato - ${contact.name}`,
    html: `
      <h3>Novo contato no portfólio</h3>
      <p><strong>Nome:</strong> ${contact.name}</p>
      <p><strong>Email:</strong> ${contact.email}</p>
      <p><strong>Mensagem:</strong></p>
      <p>${contact.message}</p>
    `
  })
}
