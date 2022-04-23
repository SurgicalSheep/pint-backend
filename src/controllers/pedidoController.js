const controllers = {};
var Pedido = require("../models/Pedido");
var PedidoSala = require("../models/PedidoSala");
var sequelize = require("../models/Database");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
sequelize.sync();

controllers.list = async (req, res) => {
  const data = await Pedido.findAll();
  res.json(data);
};
controllers.getPedido = async (req, res) => {
  try {
    const data = await Pedido.findByPk(req.params.id);
    res.status(200).json(data);
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
    res.status(200).json(pedido.idpedido);
  } catch {
    await t.rollback();
    res.status(400).send("Err");
  }
};

controllers.deletePedido = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const data = await Pedido.findByPk(req.params.id, { transaction: t });
    data.destroy();
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
