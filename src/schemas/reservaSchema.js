const Joi = require("joi");

const searchNotificacaoSchema = Joi.object({
    idsala: Joi.number().integer().required(),
    data: Joi.date().required()
  });

  module.exports = {
    searchNotificacaoSchema: searchNotificacaoSchema
};