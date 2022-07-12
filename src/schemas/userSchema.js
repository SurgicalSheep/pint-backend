const Joi = require("joi");

const utilizadorSchema = Joi.object({
  admin: Joi.boolean(),

  nome: Joi.string().min(3).max(30).required(),

  telemovel: Joi.string()
    .regex(/^[0-9]{9}$/)
    .required()
    .messages({ "string.pattern.base": `telemovel must be 9 digit number` }),

  email: Joi.string().email().lowercase().required(),

  password: Joi.string().min(3).required(),

  estado: Joi.boolean(),

  firstlogin: Joi.boolean(),

  verificado: Joi.boolean(),

  foto:Joi.string().allow(null,''),

  idcentro:Joi.number().integer().required()
});

const editUtilizador = Joi.object({
    nome: Joi.string().min(3).max(30).optional(),
  
    telemovel: Joi.string()
      .regex(/^[0-9]{9}$/)
      .required()
      .messages({ "string.pattern.base": `telemovel must be 9 digit number` }).optional(),
  
    password: Joi.string().min(3).optional(),
  
    foto:Joi.string().allow(null).optional()
  });

  const editUtilizadorAdmin = Joi.object({
    admin: Joi.boolean().optional(),
  
    nome: Joi.string().min(3).max(30).optional(),
  
    telemovel: Joi.string()
      .regex(/^[0-9]{9}$/)
      .messages({ "string.pattern.base": `telemovel must be 9 digit number` }).optional(),
  
    email: Joi.string().email().lowercase().optional(),
  
    password: Joi.string().min(3).optional(),
  
    estado: Joi.boolean().optional(),
  
    firstlogin: Joi.boolean().optional(),
  
    verificado: Joi.boolean().optional(),
  
  
    foto:Joi.string().allow(null,"").optional(),
  
    idcentro:Joi.number().integer().optional()
  });

module.exports = {
    utilizadorSchema:utilizadorSchema,
    editUtilizador:editUtilizador,
    editUtilizadorAdmin:editUtilizadorAdmin
};
