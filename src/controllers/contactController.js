import { query } from '../db/connection.js'
import { validateContact } from '../validators/contact.js'

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

    res.status(201).json({
      success: true,
      message: 'Mensagem recebida com sucesso',
      data: result.rows[0]
    })
  } catch (error) {
    next(error)
  }
}
