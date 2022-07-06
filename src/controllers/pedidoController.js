const controllers = {};
var Pedido = require("../models/pedido");
var sequelize = require("../models/database");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

controllers.list = async (req, res) => {
  let {limit,offset} = req.query;
  if (!limit || limit == 0) {
    limit = 5;
  }
  if (!offset) {
    offset = 0;
  }
  const data = await Pedido.findAll({
    limit:limit,
    offset:offset
  });
  res.json({data:data});
};
controllers.getPedido = async (req, res) => {
  try {
    const data = await Pedido.findByPk(req.params.id);
    res.status(200).json({data:data});
  } catch {
    res.status(400).send("Err");
  }
};
controllers.insertPedido = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const pedido = await Pedido.create(
      {
        duracaomax: req.body.duracaomax,
        idutilizador: req.body.idutilizador,
        descricao: req.body.descricao,
        idsala: req.body.idsala
      },
      { transaction: t }
    );
    await t.commit();
    res.status(200).json({data:pedido});
  } catch {
    await t.rollback();
    res.status(400).send("Err");
  }
};

controllers.deletePedido = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    await Pedido.destroy({where:{idpedido:req.params.id}}, { transaction: t });
    await t.commit();
    res.status(200).send("1");
  } catch (err) {
    await t.rollback();
    res.status(400).send("Err");
  }
};

controllers.editPedido = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const id = req.params.id;

    await Pedido.update(
      {
        duracaomax: req.body.duracaomax,
        idutilizador: req.body.idutilizador,
        descricao: req.body.descricao,
        idsala: req.body.idsala
      },
      { where: { idpedido: id } },
      { transaction: t }
    );
    await t.commit();
    res.status(200).send("1");
  } catch (error) {
    await t.rollback();
    res.status(400).send("Err");
  }
};
module.exports = controllers;
