const Joi = require("joi");

const searchNotificacaoSchema = Joi.object({
    idsala: Joi.number().integer().required(),
    data: Joi.date().required()
  });

  const createSalaSchema = Joi.object({
    nome: Joi.string().min(5).allow(null,""),
    lotacaomax: Joi.number().integer().required(),
    lotacao: Joi.number().integer().allow(null),
    descricao: Joi.string().min(5).allow(null,""),
    estado: Joi.boolean().required().default(true),
    justificacaoestado: Joi.string().min(5).allow(null,""),
    idcentro: Joi.number().integer().required()
  });

  const editSalaSchema = Joi.object({
    nome: Joi.string().min(5).allow("").optional(),
    lotacaomax: Joi.number().integer().optional(),
    lotacao: Joi.number().integer().optional(),
    descricao: Joi.string().min(5).allow("").optional(),
    estado: Joi.boolean().optional(),
    justificacaoestado: Joi.string().min(5).allow("").optional(),
    idcentro: Joi.number().integer().optional()
  });
  

  module.exports = {
    searchNotificacaoSchema: searchNotificacaoSchema,
    createSalaSchema:createSalaSchema,
    editSalaSchema:editSalaSchema
};