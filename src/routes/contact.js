import express from 'express'
import { createContact } from '../controllers/contactController.js'

const router = express.Router()

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Enviar mensagem de contato
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, message]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               email:
 *                 type: string
 *                 format: email
 *               message:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *     responses:
 *       201:
 *         description: Mensagem enviada com sucesso
 *       422:
 *         description: Validação falhou
 *       500:
 *         description: Erro interno
 */
router.post('/', createContact)

export default router
