const controllers = {};
var EmpregadoLimpeza = require("../models/empregadoLimpeza");
var Utilizador = require("../models/utilizador");
var sequelize = require("../models/database");
const Sequelize = require("sequelize");
const Centro = require("../models/centro");
const Op = Sequelize.Op;

controllers.list = async (req, res) => {
  const data = await EmpregadoLimpeza.findAll();
  res.json({data:data});
};
controllers.editEmpregadoLimpeza = async (req, res) => {
  let id = req.params.id;
  if (Number.isInteger(+id)) {
    const t = await sequelize.transaction();
    try {
      await EmpregadoLimpeza.update(
        {
          ncolaborador: req.body.ncolaborador,
          admin: req.body.admin,
          nome: req.body.nome,
          idcentro: req.body.idcentro,
          telemovel: req.body.telemovel,
          email: req.body.email,
          password: req.body.password,
          estado: req.body.estado,
          firstlogin: req.body.firstlogin,
          verificado: req.body.verificado,
          token: req.body.token,
          foto: req.body.foto,
          disponibilidade: req.body.disponibilidade,
        },
        { where: { idutilizador: id }, transaction: t }
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
controllers.insertEmpregadoLimpeza = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const data = await EmpregadoLimpeza.create(
      {
        ncolaborador: req.body.ncolaborador,
        admin: req.body.admin,
        nome: req.body.nome,
        idcentro: req.body.idcentro,
        telemovel: req.body.telemovel,
        email: req.body.email,
        password: req.body.password,
        estado: req.body.estado,
        firstlogin: req.body.firstlogin,
        verificado: req.body.verificado,
        token: req.body.token,
        foto: req.body.foto,
        disponibilidade: req.body.disponibilidade,
      },
      { transaction: t }
    );
    await t.commit();
    res.status(200).send({data:data});
  } catch (error) {
    await t.rollback();
    res.status(400).send(error);
  }
};

controllers.deleteEmpregadoLimpeza = async (req, res) => {
  let id = req.params.id;
  if (Number.isInteger(+id)) {
    const t = await sequelize.transaction();
    try {
      await EmpregadoLimpeza.destroy({ where: { idutilizador: id } });
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
controllers.getEmpregadoLimpeza = async (req, res) => {
  let id = req.params.id;
  if (Number.isInteger(+id)) {
    const data = await EmpregadoLimpeza.scope("noPassword").scope("noIdCentro").findByPk(id,{include:[{model:Centro}]});
    res.send({data:data});
  } else {
    res.status("422").send("Id is not an Integer!");
  }
};
controllers.bulkInsertEmpregadoLimpeza = async (req, res) => {
  try {
    await sequelize
      .sync()
      .then(() => {
        EmpregadoLimpeza.bulkCreate(req.body);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
    res.status(200).send("1");
  } catch (error) {
    res.status(400).send(error);
  }
};
module.exports = controllers;
