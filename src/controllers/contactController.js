import { query } from '../db/connection.js'
import { validateContact } from '../validators/contact.js'
import { sendConfirmationEmail, sendNotificationEmail } from '../services/emailService.js'
import logger from '../config/logger.js'

export const createContact = async (req, res, next) => {
  const requestId = `REQ-${Date.now()}` // ID único para rastrear requisição

  try {
    logger.info('Recebido POST /api/contact', {
      requestId,
      ip: req.ip,
      body: { name: req.body.name, email: req.body.email }, // Não log message completa
    })

    const { error, value } = validateContact(req.body)
    if (error) {
      logger.warn('Validação falhou em /api/contact', {
        requestId,
        errors: error.details.map(e => ({ field: e.path[0], message: e.message })),
      })

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

    logger.info('Contato salvo no BD', {
      requestId,
      contactId: contact.id,
      email: contact.email,
    })

    Promise.all([
      sendConfirmationEmail(contact.email, contact.name),
      sendNotificationEmail(contact)
    ])
      .then(() => {
        logger.info('Emails enviados com sucesso', {
          requestId,
          contactId: contact.id,
        })
      })
      .catch((err) => {
        logger.error('Erro ao enviar emails', {
          requestId,
          contactId: contact.id,
          error: err.message,
        })
      })

    logger.info('Resposta 201 enviada', {
      requestId,
      contactId: contact.id,
    })

    res.status(201).json({
      success: true,
      message: 'Mensagem recebida com sucesso',
      data: contact
    })
  } catch (error) {
    logger.error('Erro em createContact', {
      requestId,
      error: error.message,
      stack: error.stack,
    })
    next(error)
  }
}
