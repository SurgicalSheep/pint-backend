const controllers = {};
var Pedido = require("../models/pedido");
var sequelize = require("../models/database");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const client = require("../models/redisDatabase");
const createError = require("http-errors");
const Sala = require("../models/sala");

controllers.list = async (req, res, next) => {
  try {
    let {limit,offset} = req.query;
  if (!limit || limit == 0) {
    limit = 5;
  }
  if (!offset) {
    offset = 0;
  }
  const data = await Pedido.findAll({
    limit:limit,
    offset:offset,
    include:[
      {model:Sala}
    ]
  });

  let x = { data };
    const count = await Pedido.count();
    x.count = count;
  res.json(x);
  } catch (error) {
    next(error)
  }
  
};
controllers.getPedido = async (req, res, next) => {
  try {
    const data = await Pedido.findByPk(req.params.id,{include:[
      {model:Sala}
    ]});
    res.send({data:data});
  } catch (error){
    next(error)
  }
};
controllers.insertPedido = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const pedido = await Pedido.create(
      {
        duracaomax: req.body.duracaomax,
        idutilizador: req.body.idutilizador,
        descricao: req.body.descricao,
        idsala: req.body.idsala,
        estado:req.body.estado,
      },
      { transaction: t }
    );
    await t.commit();
    res.status(200).json({data:pedido});
  } catch (error){
    await t.rollback();
    next(error)
  }
};

controllers.deletePedido = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    await Pedido.destroy({where:{idpedido:req.params.id}}, { transaction: t });
    await t.commit();
    res.status(200).send("1");
  } catch (err) {
    await t.rollback();
    next(err)
  }
};

controllers.editPedido = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const id = req.params.id;

    await Pedido.update(
      {
        duracaomax: req.body.duracaomax,
        idutilizador: req.body.idutilizador,
        descricao: req.body.descricao,
        idsala: req.body.idsala,
        estado: req.body.estado
      },
      { where: { idpedido: id } },
      { transaction: t }
    );
    await t.commit();
    res.sendStatus(204)
  } catch (error) {
    await t.rollback();
    next(error)
  }
};

controllers.editTempoLimpeza = async (req, res, next) => {
  try {
    const {tempo} = req.body
    if(!/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(tempo)) return next(createError.BadRequest("Not time"));
    await client.set('tempoLimpeza', tempo);
    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
};
controllers.getTempoLimpeza = async (req, res, next) => {
try {
  const value = await client.get('tempoLimpeza');
  res.send({data:value})
} catch (error) {
  next(error)
}
};
controllers.getPedidoEstado = async (req, res, next) => {
  try {
    const {centro} = req.query
    let now = new Date();
    const pedidos = await Pedido.findAll({
      limit:10,
      where:{
        estado:false,
        data:{[Op.gte]:now}
      },
      include:[{
        model:Sala,
        where:{
          ...centro && { idcentro: centro },
        }
      }]
    })
    res.send({data:pedidos})
  } catch (error) {
    next(error)
  }
  };
module.exports = controllers;
