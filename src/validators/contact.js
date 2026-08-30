import Joi from 'joi'

const contactSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Nome deve ter no mínimo 3 caracteres',
      'string.max': 'Nome não pode exceder 100 caracteres',
      'string.empty': 'Nome é obrigatório',
      'any.required': 'Nome é obrigatório'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email inválido',
      'string.empty': 'Email é obrigatório',
      'any.required': 'Email é obrigatório'
    }),
  message: Joi.string()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Mensagem deve ter no mínimo 10 caracteres',
      'string.max': 'Mensagem não pode exceder 1000 caracteres',
      'string.empty': 'Mensagem é obrigatória',
      'any.required': 'Mensagem é obrigatória'
    })
})

export const validateContact = (data) =>
  contactSchema.validate(data, { abortEarly: false })
