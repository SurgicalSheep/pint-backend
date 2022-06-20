const Joi = require("joi");

const utilizadorSchema = Joi.object({
  ncolaborador: Joi.number().integer().required(),

  admin: Joi.boolean(),

  nome: Joi.string().alphanum().min(3).max(30).required(),

  telemovel: Joi.string()
    .regex(/^[0-9]{9}$/)
    .required()
    .messages({ "string.pattern.base": `telemovel must be 9 digit number` }),

  email: Joi.string().email().lowercase().required(),

  password: Joi.string().min(3).required(),

  estado: Joi.boolean(),

  firstlogin: Joi.boolean(),

  verificado: Joi.boolean(),

  token: Joi.string(),

  foto:Joi.string().allow(null,''),

  idcentro:Joi.number().integer().required()
});

const utilizadorSchema2 = Joi.object({
    ncolaborador: Joi.number().integer().required(),
  
    admin: Joi.boolean(),
  
    nome: Joi.string().alphanum().min(3).max(30).required(),
  
    telemovel: Joi.string()
      .regex(/^[0-9]{9}$/)
      .required()
      .messages({ "string.pattern.base": `telemovel must be 9 digit number` }),
  
    email: Joi.string().email().lowercase().required(),
  
    password: Joi.string().min(3).required(),
  
    estado: Joi.boolean(),
  
    firstlogin: Joi.boolean(),
  
    verificado: Joi.boolean(),
  
    token: Joi.string(),
  
    foto:Joi.string().allow(null,''),
  
    idcentro:Joi.number().integer().required()
  });

module.exports = utilizadorSchema;
