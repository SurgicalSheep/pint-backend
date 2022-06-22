const Joi = require("joi");

const editNotificacaoSchema = Joi.object({
    titulo: Joi.string().alphanum().min(3).max(255).optional(),
    descricao: Joi.string().alphanum().min(3).optional(),
    hora: Joi.date().optional(),
    recebida: Joi.boolean().optional()
  });

  module.exports = {
    editNotificacaoSchema: editNotificacaoSchema
};