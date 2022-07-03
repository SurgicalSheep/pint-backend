const controllers = {};
var Centro = require("../models/centro");
var Sala = require("../models/sala");
var sequelize = require("../models/database");
const Reserva = require("../models/reserva")
const Sequelize = require("sequelize");
const createError = require("http-errors")
const {createSalaSchema} = require('../schemas/salaSchema')
const Op = Sequelize.Op;

controllers.list = async (req, res) => {
  let limit=req.query.limit;
  let offset=req.query.offset;
  if(!req.query.limit || req.query.limit == 0){
    limit = 5;
  }
  if(!req.query.offset){
    offset = 0;
  }
  const data = await Sala.findAll({
    limit: limit,
    offset: offset,
    include:[{model:Centro}]
  });
  let x = {data};
  const count = await Sala.count();   
  x.count = count;
  
  res.send(x);
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
    
    if(!Number.isInteger(+id)){
      return next(createError.BadRequest("Id is not a Integer"));
    }
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

    if(!Number.isInteger(+id)){
      return next(createError.BadRequest("Id is not a Integer"));
    }

    const result = await Sala.update(req.body, { where: { idsala: id } });
    await t.commit();
    res.sendStatus(204);
  } catch (error) {
    await t.rollback();
    next(error)
  }
};
controllers.insertSala = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const result = createSalaSchema.validate(req.body)
    const sala = await Sala.create(result,{transaction:t})
    await t.commit();
    res.status(200).send(sala);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};
controllers.deleteSala = async (req, res) => {
  const t = await sequelize.transaction();
  const {id} = req.params;
  const data = await Sala.findOne({
    where: {idsala: id},
  },{transaction:t});
  try {
    data.destroy();
    res.status(200).send("1");
  } catch {
    res.status(400).send("Err");
  }
};

module.exports = controllers;
