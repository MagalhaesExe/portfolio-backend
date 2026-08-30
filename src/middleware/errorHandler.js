import { env } from '../config/env.js'

export const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err)

  const statusCode = err.statusCode || 500
  const message = err.message || 'Erro interno do servidor'

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack })
  })
}
