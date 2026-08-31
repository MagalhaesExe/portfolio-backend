import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  }
})

export const sendConfirmationEmail = async (to, name) => {
  const mailOptions = {
    from: env.EMAIL_USER,
    to,
    subject: 'Mensagem recebida - Portfolio Alex',
    html: `
      <h2>Obrigado, ${name}!</h2>
      <p>Recebemos sua mensagem e vamos responder em breve.</p>
      <p>Abraços,<br>Alex Magalhães</p>
    `
  }

  await transporter.sendMail(mailOptions)
}

export const sendNotificationEmail = async (contact) => {
  const mailOptions = {
    from: env.EMAIL_USER,
    to: env.EMAIL_USER,
    subject: `Novo contato - ${contact.name}`,
    html: `
      <h3>Novo contato no portfólio</h3>
      <p><strong>Nome:</strong> ${contact.name}</p>
      <p><strong>Email:</strong> ${contact.email}</p>
      <p><strong>Mensagem:</strong></p>
      <p>${contact.message}</p>
    `
  }

  await transporter.sendMail(mailOptions)
}
