import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'

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

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' })
})

export default app
