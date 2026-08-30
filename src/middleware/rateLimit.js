import rateLimit from 'express-rate-limit'

// Limite geral da API: 100 requisições por 15 minutos por IP
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  standardHeaders: true, // Retorna RateLimit-* headers
  legacyHeaders: false, // Desabilita X-RateLimit-* headers
  skip: (req) => {
    // Pular rate limiting em health check
    return req.path === '/health'
  },
})

// Limite específico para contato: 5 requisições por hora por IP
// Protege contra spam de formulário
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // 5 mensagens máximo
  message: 'Você já enviou 5 mensagens nesta hora. Tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  // Store em produção: usar Redis ou similar
  // Por enquanto, usa memória (OK para desenvolvimento)
})
