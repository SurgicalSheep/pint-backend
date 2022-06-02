const controllers = {};
var Equipamento = require("../models/Equipamento");
var sequelize = require("../models/Database");
const Sequelize = require("sequelize");
const Sala = require("../models/Sala");
const Op = Sequelize.Op;

controllers.list = async (req, res) => {
  const data = await Equipamento.scope("noIdSala").findAll({
    include: [
      {
        model: Sala,
      },
    ],
  });
  res.json({ equipamentos: data });
};
controllers.getEquipamento = async (req, res) => {
  let id = req.params.id;
  if (Number.isInteger(+id)) {
    const data = await Equipamento.scope("noIdSala").findByPk(id, {
      include: [
        {
          model: Sala,
        },
      ],
    });
    res.status(200).json({ equipamento: data });
  } else {
    res.status("422").send("Id is not an Integer!");
  }
};
controllers.editEquipamento = async (req, res) => {
  let id = req.params.id;
  if (Number.isInteger(+id)) {
    const t = await sequelize.transaction();
    try {
      await Equipamento.update(
        {
          tipo: req.body.tipo,
          estado: req.body.estado,
          especificacoes: req.body.especificacoes,
        },
        { where: { idequipamento: id }, transaction: t }
      );
      await t.commit();
      res.status(200).send("Ok");
    } catch (error) {
      await t.rollback();
      res.status(400).send(error);
    }
  } else {
    await t.rollback();
    res.status("422").send("Id is not an Integer!");
  }
};
controllers.insertEquipamento = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    await Equipamento.create(
      {
        tipo: req.body.tipo,
        estado: req.body.estado,
        especificacoes: req.body.especificacoes,
      },
      { transaction: t }
    );
    await t.commit();
    res.status(200).send("Ok");
  } catch (error) {
    await t.rollback;
    res.status(400).send(error);
  }
};
controllers.deleteEquipamento = async (req, res) => {
  let id = req.params.id;
  if (Number.isInteger(+id)) {
    const t = await sequelize.transaction();
    try {
      await Equipamento.destroy(
        {
          where: {
            idequipamento: id,
          },
        },
        { transaction: t }
      );
      await t.commit();
      res.status(200).send("Ok");
    } catch (error) {
      await t.rollback();
      res.status(400).send(error);
    }
  } else {
    res.status("422").send("Id is not an Integer!");
  }
};
module.exports = controllers;
