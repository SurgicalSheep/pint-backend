const controllers = {};
var Utilizador = require("../models/utilizador");
var Sala = require("../models/sala");
var Reserva = require("../models/reserva");
var sequelize = require("../models/database");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const createError = require("http-errors");
const { searchNotificacaoSchema } = require("../schemas/reservaSchema");
const Centro = require("../models/centro");
const { sendUpdateReserva } = require("../helpers/sockets");
const client = require("../models/redisDatabase");
const {
  getFileUtilizador,
} = require("../helpers/s3");

/*const isValidDate = function(date) {
  return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
}*/

function isValidDate(dateString) {
  // First check for the pattern
  if (!/^\d{4}\-\d{1,2}\-\d{1,2}$/.test(dateString)) return false;

  // Parse the date parts to integers
  var parts = dateString.split("-");
  var day = parseInt(parts[2], 10);
  var month = parseInt(parts[1], 10);
  var year = parseInt(parts[0], 10);

  // Check the ranges of month and year
  if (year < 1000 || year > 3000 || month == 0 || month > 12) return false;

  var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Adjust for leap years
  if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
    monthLength[1] = 29;

  // Check the range of the day
  return day > 0 && day <= monthLength[month - 1];
}

async function fotoConv(data) {
  for (let x of data) {
    if (x.dataValues.utilizadore.dataValues.foto) {
      try {
        let idk = await getFileUtilizador(x.dataValues.utilizadore.dataValues.idutilizador);
        x.dataValues.utilizadore.dataValues.fotoConv = idk;
      } catch (error) {}
    }
  }
}

controllers.list = async (req, res, next) => {
  try {
    let { limit, offset, pesquisa, centros, salas, data } = req.query;
    if (!req.query.limit || req.query.limit == 0) {
      limit = 5;
    }
    if (!req.query.offset) {
      offset = 0;
    }
    if (!centros) {
      centros = new Array(0);
      const allCentros = await Centro.findAll({ attributes: ["idcentro"] });
      allCentros.map((x, i) => {
        centros[i] = Number(x.dataValues.idcentro);
      });
    }
    if (!salas) {
      salas = new Array(0);
      const allSalas = await Sala.findAll({ attributes: ["idsala"] });
      allSalas.map((x, i) => {
        salas[i] = Number(x.dataValues.idsala);
      });
    }
    if (!pesquisa) pesquisa = "";
    let reservas;
    let count;
    let whereObject = {};
    let today = new Date();
    if (data) {
      if (pesquisa && !isNaN(pesquisa)) {
        whereObject = {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  "$utilizadore.ncolaborador$": pesquisa,
                },
                {
                  "$utilizadore.nome$": { [Op.iLike]: "%" + pesquisa + "%" },
                },
                {
                  "$sala.nome$": { [Op.iLike]: "%" + pesquisa + "%" },
                },
                {
                  "$utilizadore.ncolaborador$": pesquisa,
                },
              ],
            },
            {
              "$sala.idcentro$": { [Op.in]: centros },
            },
            {
              "$reservas.data$": data,
            },
            {
              "$sala.idsala$": { [Op.in]: salas },
            },
            {
              "$reservas.data$": { [Op.gt]: today },
            },
          ],
        };
      } else {
        whereObject = {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  "$utilizadore.nome$": { [Op.iLike]: "%" + pesquisa + "%" },
                },
                {
                  "$sala.nome$": { [Op.iLike]: "%" + pesquisa + "%" },
                },
              ],
            },
            {
              "$sala.idcentro$": { [Op.in]: centros },
            },
            {
              "$reservas.data$": data,
            },
            {
              "$sala.idsala$": { [Op.in]: salas },
            },
            {
              "$reservas.data$": { [Op.gt]: today },
            },
          ],
        };
      }
    } else {
      if (pesquisa && !isNaN(pesquisa)) {
        whereObject = {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  "$utilizadore.ncolaborador$": pesquisa,
                },
                {
                  "$utilizadore.nome$": { [Op.iLike]: "%" + pesquisa + "%" },
                },
                {
                  "$sala.nome$": { [Op.iLike]: "%" + pesquisa + "%" },
                },
                {
                  "$utilizadore.ncolaborador$": pesquisa,
                },
              ],
            },
            {
              "$sala.idcentro$": { [Op.in]: centros },
            },
            {
              "$sala.idsala$": { [Op.in]: salas },
            },
            {
              "$reservas.data$": { [Op.gt]: today },
            },
          ],
        };
      } else {
        whereObject = {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  "$utilizadore.nome$": { [Op.iLike]: "%" + pesquisa + "%" },
                },
                {
                  "$sala.nome$": { [Op.iLike]: "%" + pesquisa + "%" },
                },
              ],
            },
            {
              "$sala.idcentro$": { [Op.in]: centros },
            },
            {
              "$sala.idsala$": { [Op.in]: salas },
            },
            {
              "$reservas.data$": { [Op.gt]: today },
            },
          ],
        };
      }
    }
    
    reservas = await Reserva.scope("noIdUtilizador").findAll({
      limit: limit,
      offset: offset,
      include: [
        {
          model: Sala,
        },
        {
          model: Utilizador.scope("noPassword"),
        },
      ],
      where: whereObject,
      order: [["data", "ASC"]],
    });
    await fotoConv(reservas)
    count = await Reserva.count({
      include: [
        {
          model: Sala,
        },
        {
          model: Utilizador.scope("noPassword"),
        },
      ],
      where: whereObject,
      order: [["data", "ASC"]],
    });

    res.send({ count: count, data: reservas });
  } catch (error) {
    next(error);
  }
};
controllers.getReserva = async (req, res, next) => {
  try {
    const data = await Reserva.scope("noIdSala")
    .scope("noIdUtilizador")
    .findByPk(req.params.id, {
      include: [{ model: Sala }, { model: Utilizador }],
    });
  res.json({ data: data });
  } catch (error) {
    next(error)
  }
};
controllers.insertReserva = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { data, horainicio, horafinal, observacoes, idutilizador, idsala } =
      req.body;
    const x = await Reserva.create(
      {
        data: data,
        horainicio: horainicio,
        horafinal: horafinal,
        observacoes: observacoes,
        idutilizador: idutilizador,
        idsala: idsala,
      },
      { transaction: t }
    );
    sendUpdateReserva();
    await t.commit();
    res.send({ data: x });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};
controllers.deleteReserva = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    if (isNaN(id)) return createError.BadRequest("Id is not a number");
    const userId = req.idUser;
    const user = await Utilizador.findByPk(userId);

    if (user.admin == true) {
      await Reserva.destroy({ where: { idreserva: id } }, { transaction: t });
      sendUpdateReserva();
    } else {
      let now = new Date();
      let time =
        now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
      const reserva = await Reserva.findByPk(id);
      if (
        new Date(reserva.data) < now ||
        (new Date(reserva.data) == now && reserva.horainicio < time)
      )
        return next(createError.BadRequest("Can't delete previous reserva"));
      await reserva.destroy({ transaction: t });
      sendUpdateReserva();
    }
    await t.commit();
    res.sendStatus(204);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

controllers.editReserva = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    await Reserva.update(
      {
        data: req.body.data,
        horainicio: req.body.horainicio,
        horafinal: req.body.horafinal,
        observacoes: req.body.observacoes,
        idutilizador: req.body.idutilizador,
        idsala: req.body.idsala,
      },
      { where: { idreserva: req.params.id }, transaction: t }
    );
    sendUpdateReserva();
    await t.commit();
    res.sendStatus(204);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

controllers.searchReservas = async (req, res, next) => {
  try {
    const result = await searchNotificacaoSchema.validateAsync(req.query);
    console.log(result);
    const data = await Reserva.findAll({
      where: {
        [Op.and]: [{ data: result.data }, { idsala: result.idsala }],
      },
    });
    res.send({ data: data });
  } catch (error) {
    next(error);
  }
};

controllers.rangeReservas = async (req, res, next) => {
  try {
    const { start, end, centro } = req.query;
    if (!(start && end)) {
      return next(createError.BadRequest("Date missing"));
    }
    const s = new Date(start)
    const e = new Date(end)
    let data = await Reserva.count({
      attributes: ["data"],
      where: {
        data: { [Op.between]: [s, e] },
      },
      include:[{
        model:Sala,
        where:{
        ...(centro && { idcentro: centro }),
        }
      }],
      group: "data",
    });
    res.send({ data: data });
  } catch (error) {
    next(error);
  }
};

controllers.daysWithReserva = async (req, res, next) => {
  try {
    const { start, end, sala } = req.query;
    if (!(start && end && sala))
      return next(createError.BadRequest("Something missing"));
    const data = await Reserva.findAll({
      where: {
        [Op.or]: [
          {
            [Op.and]: [
              {
                horafinal: {
                  [Op.lte]: end,
                },
              },
              {
                horafinal: {
                  [Op.gte]: start,
                },
              },
            ],
          },
          {
            [Op.and]: [
              {
                horainicio: {
                  [Op.lte]: end,
                },
              },
              {
                horainicio: {
                  [Op.gte]: start,
                },
              },
            ],
          },
        ],
      },
      include: [
        {
          model: Sala,
          where: {
            idsala: sala,
          },
        },
      ],
    });
    res.send({ data });
  } catch (error) {
    next(error);
  }
};

function Returnsalas(Array) {
  let array_sala = [-1];
  Array.map((x, i) => {
    array_sala[i] = x.dataValues.idsala;
  });
  return array_sala;
}

controllers.freeSalas = async (req, res, next) => {
  try {
    const { data, horainicio, horafinal, centro } = req.query;
    if (!(data && horainicio && horafinal && centro))
      return next(createError.BadRequest("Something missing"));
    const salasRemove = await Sala.findAll({
      attributes: ["idsala"],
      include: [
        {
          model: Reserva,
          attributes: [],
          where: {
            data: data,
            [Op.or]: [
              {
                [Op.and]: [
                  {
                    horafinal: {
                      [Op.lte]: horafinal,
                    },
                  },
                  {
                    horafinal: {
                      [Op.gte]: horainicio,
                    },
                  },
                ],
              },
              {
                [Op.and]: [
                  {
                    horainicio: {
                      [Op.lte]: horafinal,
                    },
                  },
                  {
                    horainicio: {
                      [Op.gte]: horainicio,
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
    });

    const salas = await Sala.findAll({
      where: {
        idsala: { [Op.notIn]: [Returnsalas(salasRemove)] },
        idcentro: centro,
      },
    });
    res.send({ data: salas });
  } catch (error) {
    next(error);
  }
};

controllers.rangeReservasBySala = async (req, res, next) => {
  try {
    const { start, end, sala } = req.query;
    if (!(start && end && sala)) {
      return next(createError.BadRequest("Something missing"));
    }
    const val = await Reserva.findAll({
      where: {
        data: { [Op.between]: [new Date(start), new Date(end)] },
      },
      include: [
        {
          model: Sala,
          where: {
            idsala: sala,
          },
          attributes: [],
        },
      ],
    });
    res.send({ data: val });
  } catch (error) {
    next(error);
  }
};

controllers.reservasDecorrer = async (req, res, next) => {
  try {
    const { centro } = req.query;
    let now = new Date();
    let time = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();

    const data = await Reserva.findAll({
      where: {
        [Op.and]: [
          {
            horafinal: { [Op.gte]: time },
          },
          {
            horainicio: {
              [Op.lte]: time,
            },
          },
          {
            data: now,
          },
          {
            [Op.not]: [
              {
                horafinal: { [Op.lte]: time },
              },
            ],
          },
        ],
      },
      include: [
        {
          model: Sala,
          where: {
            ...(centro && { idcentro:centro  }),
          },
        },
        {
          model: Utilizador,
        },
      ],
    });
    res.send({ data });
  } catch (error) {
    next(error);
  }
};

controllers.salasUtilizadasPercent = async (req, res, next) => {
  try {
    const { centro } = req.query;
    const lotacoesMax = await Sala.findAll({
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("lotacaomax")), "lotacaomax"],
      ],
      where: {
        idcentro: centro,
      },
    });
    const salasCentro = await Sala.findAll({
      where: { idcentro: centro },
    });
    let countGeral = [];
    for (let lotacao of lotacoesMax) {
      let c = await Reserva.count({
        include: [
          {
            model: Sala,
            where: {
              lotacaomax: lotacao.dataValues.lotacaomax,
              idcentro: centro,
            },
          },
        ],
      });
      countGeral.push({ lotacaoMax: lotacao.dataValues.lotacaomax, count: c });
    }
    let countSolo = [];
    for (let sala of salasCentro) {
      let c = await Reserva.count({
        include: [
          {
            model: Sala,
            where: { idsala: sala.dataValues.idsala, idcentro: centro },
          },
        ],
      });
      countSolo.push({
        idsala: sala.dataValues.idsala,
        count: c,
        lotacaoMax: sala.dataValues.lotacaomax,
        nome: sala.dataValues.nome,
      });
    }
    let arrayFinal = [];

    countGeral.map((x) => {
      countSolo.map((y) => {
        if (x.lotacaoMax == y.lotacaoMax) {
          let percent = (y.count * 100) / x.count;
          if (!percent) percent = 0;
          arrayFinal.push({
            idsala: y.idsala,
            p: percent,
            lotacaoMax: y.lotacaoMax,
            nome: y.nome,
          });
        }
      });
    });

    res.send(arrayFinal);
  } catch (err) {
    next(err);
  }
};
controllers.salasAlocacaoMensal = async (req, res, next) => {
  try {
    const { centro } = req.query;
    let now = new Date();
    let todayData = new Date();
    todayData.setHours(0, 0, 0, 0);
    let previousMonth = new Date();
    previousMonth.setMonth(now.getMonth() - 1);
    let time = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
    const salasCentro = await Sala.findAll({
      where: { idcentro: centro },
    });
    let final = [];
    for (let x of salasCentro) {
      let nome = x.dataValues.nome
      let reservas1Month = await Reserva.findAll({
        where: {
          [Op.and]: [
            {
              data: { [Op.lt]: now },
            },
            {
              data: { [Op.gt]: previousMonth },
            },
            {
              idsala: x.idsala,
            },
          ],
        },
        order: [["data", "ASC"]],
      });
      let reservasMinutos = [];
      for (let w of reservas1Month) {
        //create date format
        let horaInicioArray = w.dataValues.horainicio.split(":");
        let horaI = horaInicioArray[0];
        let minutoI = horaInicioArray[1];
        let horaFimArray = w.dataValues.horafinal.split(":");
        let horaF = horaFimArray[0];
        let minutoF = horaFimArray[1];
        var start = new Date(todayData);
        start.setHours(horaI);
        start.setMinutes(minutoI);
        start.setSeconds(0);
        var end = new Date(todayData);
        end.setHours(horaF);
        end.setMinutes(minutoF);
        end.setSeconds(0);
        let timeDiff = (end.getTime() - start.getTime()) / 1000 / 60;
        let exists = false;
        reservasMinutos.map((y) => {
          if (y.dia == w.dataValues.data) {
            [nome] = [nome] + timeDiff;
            exists = true;
          }
        });
        if (!exists) {
          let a = final.findIndex((v) => v.dia == w.dataValues.data);
          if (a !== -1) {
            
            final[a][x.nome] = timeDiff
          } else {
            reservasMinutos.push({[x.nome]: timeDiff,dia: w.dataValues.data});
          }
          
        }
      }
      if (reservasMinutos.length > 0) final.push(...reservasMinutos);
    }
    final.map((x)=>{
      for (const [key,value] of Object.entries(x)) {
        if(key != "dia"){
          let p = (Math.round(value * 100)/1440).toFixed(2)
          x[key] = p
        }
      }
      
    })
    res.send({ data:final });
  } catch (err) {
    next(err);
  }
};

module.exports = controllers;
