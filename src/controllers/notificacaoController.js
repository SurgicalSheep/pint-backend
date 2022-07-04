const controllers = {};
var Notificacao = require("../models/notificacao");
var UtilizadorNotificacao = require("../models/utilizadoresNotificacao");
var sequelize = require("../models/database");
const Utilizador = require("../models/utilizador");
const { editNotificacaoSchema } = require("../schemas/notificacaoSchema");
const fs = require("fs");

controllers.list = async (req, res) => {
  const data = await Notificacao.scope("noIdUtilizador").findAll({
    where: {},
    include: [
      {
        model: Utilizador.scope("noIdCentro"),
        as: "utilizador",
        where: {},
      },
    ],
  });
  res.send({ data: data });
};

controllers.getTop10Notificacao = async (req, res) => {
  const data = await Notificacao.scope("noIdUtilizador").findAll({
    limit: 10,
    order: [["hora", "DESC"]],
    where: {},
    include: [
      {
        model: Utilizador.scope("noIdCentro"),
        as: "utilizador",
        where: {},
      },
    ],
  });
  res.send({ data: data });
};

controllers.getNotificacao = async (req, res, next) => {
  try {
    const data = await Notificacao.findByPk(req.params.id,{
    include:[
      {model:Utilizador, as: "utilizador",}
    ]
  });
  if (data.dataValues.utilizador.dataValues.foto) {
    try {
      let idk = fs.readFileSync(
        data.dataValues.utilizador.dataValues.foto,
        "base64",
        (err, val) => {
          if (err) return err;
          return val;
        }
      );
      data.dataValues.utilizador.dataValues.fotoConv = idk;
    } catch (error) {
      data.dataValues.utilizador.dataValues.fotoConv = "";
    }
    
  }
  res.send({ data: data });
  } catch (error) {
    next(error)
  }
  
};

controllers.insertNotificacao = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    console.log(req.body);
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
    res.send({ data: not });
  } catch (error) {
    await t.rollback();
    return next(error);
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

controllers.getNotificacoesUtilizador = async (req, res, next) => {
  try {
    const data = await Utilizador.findAll({
      attributes: [],
      where: {},
      include: [
        {
          model: Notificacao,
          include: [
            { model: Utilizador.scope("noPassword"), as: "utilizador" },
          ],
          through: {
            attributes: [],
            where: { idutilizador: req.params.id },
          },
          where: {},
        },
      ],
    });
    
    data[0].dataValues.notificacoes.forEach((x, i) => {
      if (x.dataValues.utilizador) {
        if (x.dataValues.utilizador.dataValues.foto) {
          let idk = fs.readFileSync(
            x.dataValues.utilizador.dataValues.foto,
            "base64",
            (err, val) => {
              if (err) return err;
              return val;
            }
          );
          x.dataValues.utilizador.dataValues.fotoConv = idk;
        }
      }
    });
    res.send({ data: data });
  } catch (error) {
    next(error);
  }
};

controllers.editNotificacao = async (req, res, next) => {
  const { id } = req.params;
  if (Number.isInteger(+id)) {
    const t = await sequelize.transaction();
    try {
      const result = await editNotificacaoSchema.validateAsync(req.body);
      await Notificacao.update(
        result,
        { where: { idnotificacao: id } },
        { transaction: t }
      );
      await t.commit();
      res.send({ data: "Notificacao updated!" });
    } catch (error) {
      await t.rollback();
      return next(error);
    }
  } else {
    next(createError.BadRequest("Id is not a Integer"));
  }
};

function fotoConv(data) {
  data[0].dataValues.notificacoes.forEach((x,i) => {
    if (x.dataValues.utilizador) {
      if (x.dataValues.utilizador.dataValues.foto) {
        let idk = fs.readFileSync(
          x.dataValues.utilizador.dataValues.foto,
          "base64",
          (err, val) => {
            if (err) return err;
            return val;
          }
        );
        x.dataValues.utilizador.dataValues.fotoConv = idk;
      }
    }
  });
}

module.exports = controllers;
