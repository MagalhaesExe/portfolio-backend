import { query } from '../db/connection.js'
import { validateContact } from '../validators/contact.js'
import { sendConfirmationEmail, sendNotificationEmail } from '../services/emailService.js'

export const createContact = async (req, res, next) => {
  try {
    const { error, value } = validateContact(req.body)
    if (error) {
      return res.status(422).json({
        success: false,
        errors: error.details.reduce((acc, e) => {
          acc[e.path[0]] = e.message
          return acc
        }, {})
      })
    }

    const result = await query(
      'INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3) RETURNING *',
      [value.name, value.email, value.message]
    )

    const contact = result.rows[0]

    Promise.all([
      sendConfirmationEmail(contact.email, contact.name),
      sendNotificationEmail(contact)
    ]).catch((err) => console.error('[EMAIL ERROR]', err))

    res.status(201).json({
      success: true,
      message: 'Mensagem recebida com sucesso',
      data: contact
    })
  } catch (error) {
    next(error)
  }
}
