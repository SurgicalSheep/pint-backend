const Joi = require("joi");

const searchNotificacaoSchema = Joi.object({
    idsala: Joi.number().integer().required(),
    data: Joi.date().required()
  });

  const createSalaSchema = Joi.object({
    data: Joi.date().required(),
    nome: Joi.string().min(5).allow(null,""),
    lotacaomax: Joi.number().integer().required(),
    lotacao: Joi.number().integer().allow(null),
    descricao: Joi.string().min(5).allow(null,""),
    estado: Joi.boolean().required().default(true),
    justificacaoestado: Joi.string().min(5).allow(null,"")
  });

  module.exports = {
    searchNotificacaoSchema: searchNotificacaoSchema
};