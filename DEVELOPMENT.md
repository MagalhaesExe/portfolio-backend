# Guia de Desenvolvimento - Portfolio Backend

## Contexto do Projeto

**Desenvolvedor**: Alex Magalhães da Silva Junior
**Objetivo**: API REST para suportar o formulário de contato e a documentação do Portfolio Full-Stack
**Stack**: Node.js + Express.js + PostgreSQL + Swagger/OpenAPI

## Arquitetura do Projeto

```
portfolio-backend/
├── src/
│   ├── controllers/
│   │   └── contactController.js      (Lógica de contato)
│   ├── routes/
│   │   └── contact.js                (Rota POST /api/contact)
│   ├── middleware/
│   │   ├── errorHandler.js           (Tratamento centralizado de erros)
│   │   └── rateLimit.js              (Rate limiting global e de contato)
│   ├── db/
│   │   ├── connection.js             (Pool PostgreSQL)
│   │   └── init.sql                  (Schema do BD)
│   ├── services/
│   │   └── emailService.js           (Envio de email via Resend)
│   ├── validators/
│   │   └── contact.js                (Schemas Joi para validação)
│   ├── config/
│   │   ├── env.js                    (Variáveis de ambiente)
│   │   └── logger.js                 (Logger Winston)
│   ├── app.js                        (Setup Express)
│   ├── server.js                     (Inicializar servidor)
│   └── swagger.js                    (Config Swagger/OpenAPI)
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── DEVELOPMENT.md (este arquivo)
```

## Funcionalidades

### 1. Endpoint de Contato

**POST `/api/contact`**

Request body:
```json
{
  "name": "string (3-100 caracteres)",
  "email": "string (email válido)",
  "message": "string (10-1000 caracteres)"
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

Erros (422 Unprocessable Entity):
```json
{
  "success": false,
  "errors": {
    "email": "Email inválido"
  }
}
```

Rate limit dedicado: 5 requisições/hora por IP (`middleware/rateLimit.js`).

### 2. Envio de Email (Resend)

Ao salvar um contato no banco, dispara em paralelo (`Promise.allSettled`, sem bloquear a resposta):
- Email de confirmação para quem enviou a mensagem
- Email de notificação para o dono do site (`EMAIL_USER`)

Usamos a API do [Resend](https://resend.com) em vez de SMTP (Nodemailer) porque hosts free (como o Render) costumam bloquear conexões SMTP de saída (portas 465/587); a API do Resend funciona via HTTPS.

Sem verificar um domínio próprio no Resend, o remetente padrão (`onboarding@resend.dev`) só entrega para o email cadastrado na conta — ou seja, hoje só o email de notificação funciona de fato em produção; o de confirmação ao visitante depende de verificar um domínio.

### 3. Documentação Swagger/OpenAPI

- Auto-gerada em `/api-docs` a partir dos comentários JSDoc em `routes/*.js`
- `SWAGGER_URL` define a URL do servidor exibida no Swagger UI

## Banco de Dados - PostgreSQL

### Schema (`src/db/init.sql`)

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
```

Rodar manualmente contra um banco novo:
```bash
psql "$DATABASE_URL" -f src/db/init.sql
```

### Conexão com Pool (`src/db/connection.js`)

```javascript
import pg from 'pg'
import { env } from '../config/env.js'

const { Pool } = pg

const pool = new Pool({
  connectionString: env.DATABASE_URL
})

export const query = (text, params) => pool.query(text, params)
export const getClient = () => pool.connect()
```

## Variáveis de Ambiente

Ver `.env.example` na raiz do projeto para a lista completa e comentada. Resumo:

| Variável | Descrição |
|---|---|
| `NODE_ENV` / `PORT` | ambiente e porta do servidor |
| `DATABASE_URL` | connection string do PostgreSQL |
| `EMAIL_USER` | email que recebe as notificações de contato |
| `RESEND_API_KEY` | API key do Resend, usada para enviar os emails |
| `CORS_ORIGIN` | URL do frontend autorizada pelo CORS |
| `SWAGGER_URL` | URL pública usada como servidor no Swagger |
| `LOG_LEVEL` | nível de log do Winston |

## Setup Local - Passo a Passo

### 1. PostgreSQL

Suba um Postgres local (Docker, instalação nativa, etc.) e crie o schema:

```bash
psql "$DATABASE_URL" -f src/db/init.sql
```

### 2. Arquivo .env

```bash
cp .env.example .env
# Editar com valores reais
```

### 3. Instalar dependências e rodar

```bash
npm install
npm run dev
```

API disponível em `http://localhost:3000`
Swagger em `http://localhost:3000/api-docs`

## Convenções de Nomenclatura

- **Controllers**: `nomeController.js` (contactController.js)
- **Rotas**: `nome.js` (contact.js)
- **Funções**: camelCase (createContact, sendConfirmationEmail)
- **Constantes**: UPPER_SNAKE_CASE (PORT, DATABASE_URL)
- **Variáveis**: camelCase (userData, errorMessage)

## Deploy

- **Backend**: Web Service + PostgreSQL no Render (planos Free), auto-deploy a cada push em `main`
- **Frontend**: Vercel
- **Email**: Resend (ver seção acima)

Pendências conhecidas do plano Free:
- O banco Postgres free do Render expira após 30 dias (precisa upgrade pra plano pago se for usar permanentemente)
- O Web Service free "dorme" após ~15 min de inatividade (cold start de 30-50s na próxima requisição)
- Email de confirmação ao visitante requer verificar um domínio próprio no Resend

## Recursos Úteis

- [Express Docs](https://expressjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Swagger/OpenAPI](https://swagger.io/)
- [Resend Docs](https://resend.com/docs)
- [Joi Validation](https://joi.dev/)
