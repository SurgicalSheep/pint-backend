const controllers = {};
var Centro = require("../models/centro");
var Sala = require("../models/sala");
var sequelize = require("../models/database");
const Reserva = require("../models/reserva")
const Sequelize = require("sequelize");
const createError = require("http-errors")
const {createSalaSchema,editSalaSchema} = require('../schemas/salaSchema')
const Op = Sequelize.Op;
const {createNotificacaoSalaIndisponivel} = require('../helpers/createNotificacao')
const {sendUpdateSala} = require("../helpers/sockets")

controllers.list = async (req, res, next) => {
  try {
    let {limit,offset,pesquisa,lotacao} = req.query
    let centro = req.query.centros
  if(!limit || limit == 0){
    limit = 5;
  }
  if(!req.query.offset){
    offset = 0;
  }
  if(!centro){
    centro = new Array(0)
    const centros = await Centro.findAll({attributes:["idcentro"]});
    centros.map((x,i)=>{
      centro[i] = Number(x.dataValues.idcentro)
    })
  }
  if(!pesquisa) pesquisa="";
  let data
  if(!lotacao){
    data = await Sala.findAll({
      limit: limit,
      offset: offset,
      where:{nome:{[Op.iLike]:"%"+pesquisa+"%"}},
      include:[{
        model:Centro,
        where:{
          idcentro:{[Op.in]:centro}
        }
      }],
      order: [
        ['nome', 'ASC']
    ]
    });
  }else{
    if(isNaN(lotacao[0])|| isNaN(lotacao[1])) return next(createError.BadRequest("Lotacao not a number"))
    data = await Sala.findAll({
      limit: limit,
      offset: offset,
      where:{
        [Op.and]:[{lotacao:{[Op.between]:[lotacao[0],lotacao[1]]}},{nome:{[Op.iLike]:"%"+pesquisa+"%"}}]
      },
      include:[{
        model:Centro,
        where:{
          idcentro:{[Op.in]:centro}
        }
      }],
      order: [
        ['nome', 'ASC']
    ]
    });
  }
  let count
  if(!lotacao){
    count = await Sala.count({where:{nome:{[Op.iLike]:"%"+pesquisa+"%"}},include:[{
      model:Centro,
      where:{
        idcentro:{[Op.in]:centro}
      }
    }]})  
  }else{
    count = await Sala.count({
      where:{
        [Op.and]:[{lotacao:{[Op.between]:[lotacao[0],lotacao[1]]}},{nome:{[Op.iLike]:"%"+pesquisa+"%"}}]
      },
      include:[{
        model:Centro,
        where:{
          idcentro:{[Op.in]:centro}
        }
      }]
    })
  }
  let x = {data}; 
  x.count = count;
  
  res.send(x);
  } catch (error) {
    next(error)
  }
  
};
controllers.count = async (req, res) => {
  const data = await Sala.Count();
  res.send({ data: data });
};
controllers.getSalaReservas = async(req,res,next) => {
  let {limit,offset} = req.body
  const {id} = req.params;
    
  if(!Number.isInteger(+id)){
    return next(createError.BadRequest("Id is not a Integer"));
  }
  if(!req.query.limit || req.query.limit == 0){
    limit = 5;
  }
  if(!req.query.offset){
    offset = 0;
  }
  try {
    const data = await Sala.findAll({
      limit: limit,
      offset: offset,
      where:{idsala:id},
      include:[{model:Reserva}]
    })
    let aux = {data}
    const count = await Reserva.count({where:{idsala:id}});   
    aux.count = count;
    res.send(aux)
  } catch (error) {
    next(error)
  }
  
}
controllers.getSala = async (req, res, next) => {
  const {id} = req.params;
    
    if(isNaN(id)) return next(createError.BadRequest("Id is not a Integer"));
  const data = await Sala.findOne({
    where: {
      idsala: id
    },
    include:[{model:Centro}]
  });
  res.send({ data: data });
};
controllers.editSala = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const {id} = req.params;
    if(isNaN(id)) return next(createError.BadRequest("Id is not a Integer"));
    const result = await editSalaSchema.validateAsync(req.body)
    const salaUpdated = await Sala.update(result, { where: { idsala: id },transaction:t,returning: true });
    if(result.estado == false){
      createNotificacaoSalaIndisponivel(salaUpdated[1][0].dataValues)
    }
    await t.commit();
    sendUpdateSala();
    res.sendStatus(204);
  } catch (error) {
    await t.rollback();
    next(error)
  }
};
controllers.insertSala = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const result = await createSalaSchema.validateAsync(req.body)
    const sala = await Sala.create(result,{transaction:t})
    await t.commit();
    sendUpdateSala();
    res.send({data:sala});
  } catch (error) {
    await t.rollback();
    next(error);
  }
};
controllers.deleteSala = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const {id} = req.params;
    if(isNaN(id)) return next(createError.BadRequest("Id is not a Integer"));
     await Sala.destroy({
      where: {idsala: id},
    },{transaction:t});
    await t.commit();
    sendUpdateSala();
    res.sendStatus(204)
  } catch (error) {
    await t.rollback();
    next(error)
  }
};

module.exports = controllers;
