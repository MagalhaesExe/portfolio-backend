import express from 'express'
import { createContact } from '../controllers/contactController.js'

const router = express.Router()

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Enviar mensagem de contato
 *     tags: [Contato]
 *     description: Cria um novo contato e envia email de confirmação
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
 *                 example: "João Silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "joao@example.com"
 *               message:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 example: "Adorei seu portfólio! Trabalho com React também."
 *     responses:
 *       201:
 *         description: Mensagem enviada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     message:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       422:
 *         description: Validação falhou
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 errors:
 *                   type: object
 *                   additionalProperties:
 *                     type: string
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', createContact)

export default router
