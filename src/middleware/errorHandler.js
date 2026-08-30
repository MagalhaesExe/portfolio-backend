import { env } from '../config/env.js'
import logger from '../config/logger.js'

export const errorHandler = (err, req, res, next) => {
  const requestId = `REQ-${Date.now()}`

  logger.error('Erro não tratado', {
    requestId,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  })

  const statusCode = err.statusCode || 500
  const message = err.message || 'Erro interno do servidor'

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === 'development' && { requestId, stack: err.stack })
  })
}
