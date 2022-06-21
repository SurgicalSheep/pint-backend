const Joi = require("joi");

const centroSchema = Joi.object({
  nome: Joi.string().alphanum().min(3).max(30).required(),
  cidade: Joi.string().alphanum().min(3).max(30).required(),
  endereco: Joi.string().alphanum().min(3).max(30).required(),
  imagem: Joi.string().allow(null,''),
  descricao: Joi.string().alphanum().min(3).max(30),
  estado: Joi.boolean()
});

const editcentroSchema = Joi.object({
    nome: Joi.string().alphanum().min(3).max(30).allow(null),
    cidade: Joi.string().alphanum().min(3).max(30).allow(null),
    endereco: Joi.string().alphanum().min(3).max(30).allow(null),
    imagem: Joi.string().allow(null),
    descricao: Joi.string().alphanum().min(3).max(30).allow(null),
    estado: Joi.boolean().allow(null)
  });

module.exports = {
    centroSchema: centroSchema,
    editcentroSchema: editcentroSchema
};