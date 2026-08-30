import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { env } from './config/env.js'
import logger from './config/logger.js'
import { globalLimiter, contactLimiter } from './middleware/rateLimit.js'
import swaggerSpec from './swagger.js'
import contactRoutes from './routes/contact.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

// 1. Middleware de logging
app.use((req, res, next) => {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    const level = res.statusCode >= 400 ? 'warn' : 'info'

    logger[level](`${req.method} ${req.path}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    })
  })

  next()
})

// 2. Middleware de body parsing
app.use(express.json())

// 3. CORS
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true
}))

// 4. Rate limiting global
app.use(globalLimiter)

// 5. Health check (não afetado por rate limit)
app.get('/health', (req, res) => {
  res.json({ status: 'OK' })
})

// 6. Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// 7. Rotas com rate limit específico
app.use('/api/contact', contactLimiter, contactRoutes)

// 8. 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' })
})

// 9. Error Handler (DEVE SER O ÚLTIMO)
app.use(errorHandler)

export default app
