import winston from 'winston'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Formato customizado
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`
    if (stack) log += `\n${stack}`
    if (Object.keys(meta).length > 0) log += `\n${JSON.stringify(meta, null, 2)}`
    return log
  })
)

// Logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports: [
    // Console (todos os níveis)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      ),
    }),

    // Arquivo: todos os logs
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/app.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5, // Manter últimos 5 arquivos
    }),

    // Arquivo: apenas erros
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
})

export default logger
