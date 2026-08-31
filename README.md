# Portfolio Backend

API REST em Node.js + Express + PostgreSQL que dá suporte ao formulário de contato e à documentação interativa do [portfólio de Alex Magalhães](https://portfolio-frontend-sage-gamma.vercel.app).

## Em produção

| | |
|---|---|
| **Frontend** | https://portfolio-frontend-sage-gamma.vercel.app |
| **Backend (API)** | https://portfolio-backend-lwj4.onrender.com |
| **Swagger / OpenAPI** | https://portfolio-backend-lwj4.onrender.com/api-docs |

> Hospedado no plano Free do Render — a primeira requisição após ~15 min de inatividade pode levar 30-50s (cold start).

## Stack

- **Node.js + Express** — servidor HTTP e roteamento
- **PostgreSQL** (`pg`) — persistência dos contatos
- **Joi** — validação de payload
- **Resend** — envio de email transacional via API HTTPS
- **Winston** — logging estruturado (console + arquivo)
- **express-rate-limit** — proteção contra abuso/spam
- **Swagger (swagger-jsdoc + swagger-ui-express)** — documentação interativa da API

## Funcionalidades

- Recebe mensagens de contato do portfólio, valida os dados e grava no Postgres
- Envia email de notificação para o dono do site a cada novo contato
- Rate limiting: limite global de requisições e limite dedicado no endpoint de contato, para conter spam de formulário
- Logging estruturado de todas as requisições e erros (com ID de rastreio por requisição)
- Documentação da API navegável via Swagger UI

## Endpoints

| Método | Rota | Descrição | Rate limit |
|---|---|---|---|
| `GET` | `/health` | Health check | isento |
| `GET` | `/api-docs` | Swagger UI | 100 req / 15 min por IP |
| `POST` | `/api/contact` | Cria um contato e dispara o email de notificação | 5 req / hora por IP |

**`POST /api/contact`** — body:

```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "message": "Adorei seu portfólio! Trabalho com React também."
}
```

Validações: `name` (3-100 caracteres), `email` (formato válido), `message` (10-1000 caracteres). Detalhes completos dos schemas e respostas no Swagger.

## Setup local

```bash
npm install
cp .env.example .env   # preencha com seus valores
npm run dev
```

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/api-docs`

## Variáveis de ambiente

Veja `.env.example` para a lista completa. Resumo:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | connection string do PostgreSQL |
| `EMAIL_USER` | email que recebe as notificações de contato |
| `RESEND_API_KEY` | API key do [Resend](https://resend.com), usada para enviar os emails |
| `CORS_ORIGIN` | URL do frontend autorizada pelo CORS |
| `SWAGGER_URL` | URL pública usada como servidor no Swagger |
| `LOG_LEVEL` | nível de log do Winston (`info`, `debug`, etc.) |

## Deploy

- **Backend**: Web Service + PostgreSQL no [Render](https://render.com) (planos Free), com auto-deploy a cada push na branch `main`
- **Frontend**: [Vercel](https://vercel.com)
- **Email**: [Resend](https://resend.com) (API HTTPS — necessário porque hosts free geralmente bloqueiam SMTP de saída)
