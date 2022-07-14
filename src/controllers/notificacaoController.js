const controllers = {};
var Notificacao = require("../models/notificacao");
var sequelize = require("../models/database");
const Utilizador = require("../models/utilizador");
const UtilizadoresNotificaco = require('../models/utilizadoresNotificacao')
const { editNotificacaoSchema } = require("../schemas/notificacaoSchema");
const fs = require("fs");
const { Op } = require("sequelize");
const createError = require('http-errors')

controllers.list = async (req, res) => {
  let {limit,offset} = req.query;
  if (!limit || limit == 0) {
    limit = 5;
  }
  if (!offset) {
    offset = 0;
  }
  const data = await Notificacao.scope("noIdUtilizador").findAll({
    where: {},
    limit:limit,
    offset:offset,
    include: [
      {
        model: Utilizador.scope("noIdCentro"),
        as: "utilizador",
        where: {},
      },
    ],
  });
  const count = await Notificacao.count()
  let x = {data}
  x.count = count
  res.send(x);
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

controllers.insertUtilizadorNotificacao = async (req, res,next) => {
  const t = await sequelize.transaction();
  try {
    const user = await Utilizador.findByPk(req.body.idutilizador);
    const noti = await Notificacao.findByPk(req.body.idnotificacao);
    await noti.addUtilizadores(user, { transaction: t });
    let socketsConnected = req.app.get('socketsConnected')
    Promise.all(
      socketsConnected.map((x)=>{
        if(x.idUser == req.body.idutilizador){
          console.log(x.idUser)
           x.emit('newNotificacao',{data:noti})
        }
      })
    )
      await t.commit();
    res.sendStatus(204);
  } catch (error){
    await t.rollback();
    next(error)
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
    let {limit,offset} = req.query;
    if (!limit || limit == 0) {
      limit = 5;
    }
    if (!offset) {
      offset = 0;
    }
    const utilizador = await Utilizador.findByPk(req.params.id)
    const data = await utilizador.getNotificacoes({limit:limit,offset:offset,joinTableAttributes:["recebida"],include:[{model:Utilizador, as: 'utilizador'}]})
    if(data.length > 0){
      data.forEach((x, i) => {
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
    
    const count = await Utilizador.count({
      attributes: [],
      where: {},
      include: [
        {
          model: Notificacao,
          include: [
            { model: Utilizador.scope("noPassword"), as: "utilizador" },
          ],
          through: {
            as:"estadoNotificacao",
            attributes: ["recebida"],
            where: { idutilizador: req.params.id },
          },
          where: {},
        },
      ],
    });
    let x = {data}
    x.count = count

    
    res.send(x);
  } catch (error) {
    next(error);
  }
};

controllers.editNotificacao = async (req, res, next) => {
  const { id } = req.params;
  if (isNaN(id)) next(createError.BadRequest("Id is not a Integer"));
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
};

controllers.notificationReceived = async (req, res, next) => {
  const {idnotificacao } = req.body;
  const user = req.idUser
  
  if (isNaN(idnotificacao)) return next(createError.BadRequest("Ids must be integer"));
  const t = await sequelize.transaction()
  try {
    await UtilizadoresNotificaco.update({recebida:true},{where:{[Op.and]:[{idnotificacao:idnotificacao},{idutilizador:user}]},transaction:t})
    await t.commit()
    res.sendStatus(204)
  } catch (error) {
    await t.rollback()
    next(error)
  }
};

controllers.allNotificationReceived = async (req, res, next) => {
  const  idutilizador  = req.idUser
  if (isNaN(idutilizador)) return next(createError.BadRequest("Id must be integer"));
  const t = await sequelize.transaction()
  try {
    await UtilizadoresNotificaco.update({recebida:true},{where:{idutilizador:idutilizador},transaction:t})
    await t.commit()
    res.sendStatus(204)
  } catch (error) {
    await t.rollback()
    next(error)
  }
};

module.exports = controllers;
