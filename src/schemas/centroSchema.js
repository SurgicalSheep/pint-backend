const Joi = require("joi");

const centroSchema = Joi.object({
  nome: Joi.string().min(3).required(),
  cidade: Joi.string().min(3).required(),
  endereco: Joi.string().min(3).required(),
  imagem: Joi.string().allow(null).optional(),
  descricao: Joi.string().min(3),
  estado: Joi.boolean()
});

const editcentroSchema = Joi.object({
    nome: Joi.string().min(3).allow(null).optional(),
    cidade: Joi.string().min(3).allow(null).optional(),
    endereco: Joi.string().min(3).allow(null).optional(),
    imagem: Joi.string().allow(null).optional(),
    descricao: Joi.string().min(3).allow(null).optional(),
    estado: Joi.boolean().allow(null).optional()
  });

module.exports = {
    centroSchema: centroSchema,
    editcentroSchema: editcentroSchema
};