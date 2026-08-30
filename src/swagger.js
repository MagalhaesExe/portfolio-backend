import swaggerJsdoc from 'swagger-jsdoc'
import { env } from './config/env.js'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Portfolio API',
      version: '1.0.0',
      description: 'API RESTful do portfólio de Alex Magalhães da Silva Junior',
      contact: {
        name: 'Alex Magalhães',
        email: 'alexmagalhaesjr15@gmail.com',
        url: 'https://github.com/MagalhaesExe'
      }
    },
    servers: [
      {
        url: env.SWAGGER_URL,
        description: 'Development server'
      }
    ]
  },
  apis: ['./src/routes/*.js']
}

export default swaggerJsdoc(options)
