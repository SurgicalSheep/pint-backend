const Joi = require("joi");

const utilizadorSchema = Joi.object({
  admin: Joi.boolean(),

  nome: Joi.string().min(3).required(),

  telemovel: Joi.string()
    .regex(/^(?:9[1-36][0-9]|2[12][0-9]|2[35][1-689]|24[1-59]|26[1-35689]|27[1-9]|28[1-69]|29[1256])[0-9]{6}$/)
    .required()
    .messages({ "string.pattern.base": `invalid telemovel` }),

  email: Joi.string().email().lowercase().required(),

  password: Joi.string().min(5).required(),

  estado: Joi.boolean(),

  firstlogin: Joi.boolean(),

  verificado: Joi.boolean(),

  foto:Joi.string().allow(''),

  idcentro:Joi.number().integer().required()
});

const editUtilizador = Joi.object({
    nome: Joi.string().min(3).optional(),
  
    telemovel: Joi.string()
      .regex(/^(?:9[1-36][0-9]|2[12][0-9]|2[35][1-689]|24[1-59]|26[1-35689]|27[1-9]|28[1-69]|29[1256])[0-9]{6}$/)
      .required()
      .messages({ "string.pattern.base": `invalid telemovel` }).optional(),
  
    foto:Joi.string().allow(null).optional()
  });

  const editUtilizadorAdmin = Joi.object({
    admin: Joi.boolean().optional(),
  
    nome: Joi.string().min(3).optional(),
  
    telemovel: Joi.string()
      .regex(/^(?:9[1-36][0-9]|2[12][0-9]|2[35][1-689]|24[1-59]|26[1-35689]|27[1-9]|28[1-69]|29[1256])[0-9]{6}$/)
      .messages({ "string.pattern.base": `invalid telemovel` }).optional(),
  
    email: Joi.string().email().lowercase().optional(),
  
    password: Joi.string().min(5).optional(),
  
    estado: Joi.boolean().optional(),
  
    firstlogin: Joi.boolean().optional(),
  
    verificado: Joi.boolean().optional(),
  
  
    foto:Joi.string().allow("").optional(),
  
    idcentro:Joi.number().integer().optional()
  });

module.exports = {
    utilizadorSchema:utilizadorSchema,
    editUtilizador:editUtilizador,
    editUtilizadorAdmin:editUtilizadorAdmin
};
