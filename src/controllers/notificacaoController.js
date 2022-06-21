const controllers = {};
var Notificacao = require("../models/notificacao");
var UtilizadorNotificacao = require("../models/utilizadoresNotificacao");
var sequelize = require("../models/database");
const Sequelize = require("sequelize");
const Utilizador = require("../models/utilizador");

controllers.list = async (req, res) => {
  const data = await Notificacao.scope('noIdUtilizador').findAll({
    where:{},
    include:[{
      model:Utilizador.scope("noIdCentro"),as:'utilizador',
      where:{}
    },
    ]
  });
  res.send({data:data});
};

controllers.getTop10Notificacao = async (req, res) => {
  const data = await Notificacao.scope('noIdUtilizador').findAll({
    limit:10,
    order:[['hora','DESC']],
    where:{},
    include:[{
      model:Utilizador.scope("noIdCentro"),as:'utilizador',
      where:{}
    },
    ]
  });
  res.send({data:data});
};

controllers.getNotificacao = async (req, res) => {
  const data = await Notificacao.findByPk(req.params.id);
  res.send({data:data});
};

controllers.insertNotificacao = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const not = await Notificacao.create(
      {
        titulo: req.body.titulo,
        descricao: req.body.descricao,
        hora: req.body.hora,
        recebida: req.body.recebida,
        idutilizador: req.body.idutilizador,
      },
      { transaction: t }
    );
    await t.commit();
    res.send({data:not});
  } catch {
    await t.rollback();
    res.status(400).send("Err");
  }
};

controllers.insertUtilizadorNotificacao = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user = await Utilizador.findByPk(req.body.idutilizador);
    const noti = await Notificacao.findByPk(req.body.idnotificacao);
    await noti.addUtilizadores(user, { transaction: t });
    await t.commit();
    res.sendStatus(204);
  } catch {
    await t.rollback();
    res.status(400).send("Err");
  }
};

controllers.deleteNotificacao = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    await Notificacao.destroy(
      { where: { idnotificacao: req.params.id } },
      { transaction: t }
    );
    await t.commit();
    res.sendStatus(204);
  } catch {
    await t.rollback();
    res.status(400).send("Err");
  }
};

controllers.getNotificacoesUtilizador = async (req, res) => {
  try {
    const data = await Utilizador.findAll({
      where: {},
      include: [
        {
          model: Notificacao,
          through: {
            attributes: [],
            where: { idutilizador: req.params.id },
          },
          where: {},
        },
      ],
    });
    
    res.send({data:data});
  } catch {
    res.status(400).send("Err");
  }
};

module.exports = controllers;
