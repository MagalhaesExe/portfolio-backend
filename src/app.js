import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { env } from './config/env.js'
import swaggerSpec from './swagger.js'
import contactRoutes from './routes/contact.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

// Middleware
app.use(express.json())
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true
}))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' })
})

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Rotas
app.use('/api/contact', contactRoutes)

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' })
})

// Error Handler (DEVE SER O ÚLTIMO)
app.use(errorHandler)

export default app
