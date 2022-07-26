const controllers = {};
var Feedback = require("../models/feedback");
var sequelize = require("../models/database");
const Sequelize = require("sequelize");
const Utilizador = require("../models/utilizador");
const Sala = require("../models/sala");
const Centro = require("../models/centro");
const { request } = require("express");
const Op = Sequelize.Op;
const { getFileUtilizador } = require("../helpers/s3");
const { sendUpdateFeedback } = require("../helpers/sockets");

controllers.list = async (req, res, next) => {
    try {
        let { limit, offset } = req.query;
  if (!limit || limit == 0) {
    limit = 5;
  }
  if (!offset) {
    offset = 0;
  }
  const data = await Feedback.scope("noIdUtilizador")
    .scope("noIdSala")
    .findAll({
      limit,
      offset,
      include: [
        { model: Utilizador.scope("noPassword"), as: "utilizadores" },
        { model: Sala },
      ],
    });

      await fotoConv(data).then(async(aaa)=>{
        let x = { data };
        const count = await Feedback.count();
        x.count = count;
        res.send(x);
      })
    } catch (error) {
        next(error)
    }
};

async function fotoConv(data) {
    for (let x of data) {
        try {
            if(x.dataValues.utilizadores?.foto){
                let idk = await getFileUtilizador(x.dataValues.utilizadores.idutilizador);
                  x.dataValues.utilizadores.dataValues.fotoConv = idk;
            }
        } catch (error) {}
      }
}
controllers.getFeedback = async (req, res, next) => {
    try {
        const id = req.params.id;
  const data = await Feedback.findOne({
    where: {
      idfeedback: {
        [Op.eq]: id,
      },
    },
  });
  res.json({ data: data });
    } catch (error) {
        next(error)
    }
  
};
controllers.insertFeedback = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const data = await Feedback.create(
      {
        idsala: req.body.idsala,
        idutilizador: req.body.idutilizador,
        classificacao: req.body.classificacao,
        comentario: req.body.comentario,
        idreserva: req.body.idreserva,
        criado_em: req.body.criado_em,
      },
      { transaction: t }
    );
    await t.commit();
    sendUpdateFeedback();
    res.send({ data: data });
  } catch (error){
    await t.rollback();
    next(error)
  }
};
controllers.deleteFeedack = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    await Feedback.destroy({
      where: {
        idfeedback: req.params.id,
      },
    });

    await t.commit();
    sendUpdateFeedback();
    res.sendStatus(204)
  } catch (error){
    await t.rollback();
    next(error)
  }
};
controllers.editFeedback = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    await Feedback.update(
      {
        idsala: req.body.idsala,
        idutilizador: req.body.idutilizador,
        classificacao: req.body.classificacao,
        comentario: req.body.comentario,
        idreserva: req.body.idreserva,
        criado_em: req.body.criado_em,
      },
      { where: { idfeedback: req.params.id }, transaction: t }
    );
    await t.commit();
    sendUpdateFeedback();
    res.status(200).send("Oke");
  } catch (error) {
    await t.rollback();
    next(error)
  }
};
module.exports = controllers;
