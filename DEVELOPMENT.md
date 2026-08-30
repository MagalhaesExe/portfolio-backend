# Guia de Desenvolvimento - Portfolio Backend

## Contexto do Projeto

**Desenvolvedor**: Alex Magalhães da Silva Junior
**Objetivo**: API REST robusta para suportar Portfolio Full-Stack
**Stack**: Node.js + Express.js + PostgreSQL + Swagger/OpenAPI

## Arquitetura do Projeto

```
portfolio-backend/
├── src/
│   ├── controllers/
│   │   └── contactController.js      (Lógica de contato)
│   ├── routes/
│   │   ├── index.js                  (Aggregador de rotas)
│   │   └── contact.js                (Rota POST /contact)
│   ├── middleware/
│   │   ├── errorHandler.js           (Tratamento centralizado de erros)
│   │   └── auth.js                   (Autenticação JWT para admin - futuro)
│   ├── db/
│   │   ├── connection.js             (Pool PostgreSQL)
│   │   ├── init.sql                  (Schema do BD)
│   │   └── queries.js                (Funções de query)
│   ├── validators/
│   │   └── contact.js                (Schemas Joi para validação)
│   ├── config/
│   │   └── env.js                    (Variáveis de ambiente)
│   ├── app.js                        (Setup Express)
│   └── server.js                     (Inicializar servidor)
├── .env.example
├── .gitignore
├── package.json
└── DEVELOPMENT.md (este arquivo)
```

## Funcionalidades Obrigatórias

### 1. Endpoint de Contato

**POST `/api/contact`**

Request body:
```json
{
  "name": "string (max 100)",
  "email": "string (valid email)",
  "message": "string (max 1000)"
}
```

Response (201 Created):
```json
{
  "success": true,
  "message": "Mensagem recebida com sucesso",
  "data": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com",
    "message": "Adorei seu portfólio!",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

Validações:
- Name: obrigatório, string, máx 100 caracteres
- Email: obrigatório, email válido
- Message: obrigatório, string, máx 1000 caracteres

Erros (422 Unprocessable Entity):
```json
{
  "success": false,
  "errors": {
    "email": "Email inválido"
  }
}
```

### 2. Envio de Email (Nodemailer)

Quando formulário é submetido:
- Enviar email de confirmação ao usuário
- Enviar notificação ao desenvolvedor (alex@email.com)
- Log de sucesso/falha

Credenciais no `.env`:
```
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_app (Google App Password)
```

### 3. Documentação Swagger/OpenAPI

- Auto-gerada em `/api-docs`
- Documentar todos os endpoints
- Exemplos de request/response
- Schemas de erro

## Banco de Dados - PostgreSQL

### Schema Inicial

```sql
-- Tabela de contatos
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);
```

### Conexão com Pool

```javascript
// db/connection.js
import pg from 'pg'
const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const query = (text, params) => pool.query(text, params)
export const getClient = () => pool.connect()
```

## Padrões de Código

### Estrutura de Controller

```javascript
// controllers/contactController.js
import { query } from '../db/connection.js'
import { sendEmail } from '../services/email.js'
import { validateContact } from '../validators/contact.js'

export const createContact = async (req, res, next) => {
  try {
    // 1. Validar entrada
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

    // 2. Salvar no BD
    const result = await query(
      'INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3) RETURNING *',
      [value.name, value.email, value.message]
    )

    const contact = result.rows[0]

    // 3. Enviar email
    await sendEmail({
      to: value.email,
      template: 'confirmation',
      data: { name: value.name }
    })

    // 4. Responder
    res.status(201).json({
      success: true,
      message: 'Mensagem recebida com sucesso',
      data: contact
    })
  } catch (error) {
    next(error) // Passar pro middleware de erro
  }
}
```

### Rotas com Express

```javascript
// routes/contact.js
import express from 'express'
import { createContact } from '../controllers/contactController.js'

const router = express.Router()

/**
 * @route   POST /api/contact
 * @desc    Enviar mensagem de contato
 * @access  Public
 */
router.post('/', createContact)

export default router
```

### Validação com Joi

```javascript
// validators/contact.js
import Joi from 'joi'

const contactSchema = Joi.object({
  name: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.max': 'Nome não pode exceder 100 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email inválido',
      'any.required': 'Email é obrigatório'
    }),
  message: Joi.string()
    .max(1000)
    .required()
    .messages({
      'string.max': 'Mensagem não pode exceder 1000 caracteres',
      'any.required': 'Mensagem é obrigatória'
    })
})

export const validateContact = (data) => contactSchema.validate(data, { abortEarly: false })
```

### Middleware de Erro Centralizado

```javascript
// middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err)

  const statusCode = err.statusCode || 500
  const message = err.message || 'Erro interno do servidor'

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}
```

### Configuração Express (app.js)

```javascript
// app.js
import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './swagger.js'
import contactRoutes from './routes/contact.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

// Middleware
app.use(express.json())
app.use(cors({
  origin: process.env.CORS_ORIGIN,
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
```

## Configuração do Swagger/OpenAPI

Criar `src/swagger.js`:

```javascript
import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Portfolio API',
      version: '1.0.0',
      description: 'API do portfólio de Alex Magalhães'
    },
    servers: [
      {
        url: process.env.SWAGGER_URL || 'http://localhost:3000',
        description: 'Development server'
      }
    ]
  },
  apis: ['./src/routes/*.js'] // Ler comentários JSDoc das rotas
}

export default swaggerJsdoc(options)
```

Depois adicionar comentários nas rotas:

```javascript
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
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mensagem enviada com sucesso
 *       422:
 *         description: Validação falhou
 */
```

## Variáveis de Ambiente

`.env.example`:
```
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio_db

# Email
EMAIL_USER=alexmagalhaesjr15@gmail.com
EMAIL_PASS=Jr15130816*

# JWT
JWT_SECRET=sua_chave_super_segura_min_32_chars

# CORS
CORS_ORIGIN=http://localhost:5173

# Swagger
SWAGGER_URL=http://localhost:3000
```

## Setup Local - Passo a Passo

### 1. PostgreSQL

```bash
# macOS com Homebrew
brew install postgresql
brew services start postgresql

# Criar banco
createdb portfolio_db

# Conectar e executar schema
psql portfolio_db < src/db/init.sql
```

### 2. Arquivo .env

```bash
cp .env.example .env
# Editar com valores reais
```

### 3. Instalar dependências

```bash
npm install
```

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

API disponível em `http://localhost:3000`
Swagger em `http://localhost:3000/api-docs`

## Ordem de Desenvolvimento Recomendada

1. **Setup inicial** (FEITO ✅)
   - Estrutura de pastas
   - Dependências instaladas
   - `.env` configurado

2. **Configuração Express** (PRÓXIMO)
   - `app.js` com middleware
   - `server.js` para iniciar
   - CORS configurado

3. **Banco de Dados**
   - `db/connection.js` (Pool PostgreSQL)
   - `db/init.sql` (Schema)
   - Testar conexão

4. **Endpoint de Contato**
   - Validação (Joi)
   - Controller
   - Rota
   - Testar com Insomnia/Postman

5. **Swagger/OpenAPI**
   - Configurar `swagger.js`
   - Documentar endpoints
   - Acessar `/api-docs`

6. **Envio de Email**
   - Configurar Nodemailer
   - Criar templates de email
   - Testar envio

7. **Tratamento de Erros**
   - Middleware centralizado
   - Status codes apropriados
   - Logs estruturados

8. **Deploy**
   - Preparar para Render/Railway
   - Variáveis de ambiente em produção
   - Testar pipeline CI/CD

## Convenções de Nomenclatura

- **Controllers**: `nomeController.js` (contactController.js)
- **Rotas**: `nome.js` (contact.js)
- **Funções**: camelCase (createContact, sendEmail)
- **Constantes**: UPPER_SNAKE_CASE (PORT, DATABASE_URL)
- **Variáveis**: camelCase (userData, errorMessage)

## Deploy - Render/Railway

- **Platform**: Render ou Railway
- **Branch**: `main`
- **Build command**: `npm install`
- **Start command**: `npm start`
- **Environment variables**: Configurar no painel (DATABASE_URL, etc)

## Recursos Úteis

- [Express Docs](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Swagger/OpenAPI](https://swagger.io/)
- [Nodemailer](https://nodemailer.com/)
- [Joi Validation](https://joi.dev/)

---

**Quando pronto, integrar com o Frontend e fazer testes end-to-end!** 🚀