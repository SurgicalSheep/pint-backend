const controllers = {};
var Utilizador = require("../models/utilizador");
var Sala = require("../models/sala");
var Reserva = require("../models/reserva");
var sequelize = require("../models/database");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const createError = require("http-errors");
const { searchNotificacaoSchema } = require("../schemas/reservaSchema");
const Centro = require("../models/centro");
const {sendUpdateReserva} = require('../helpers/sockets')

const isValidDate = function(date) {
  return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
}

controllers.list = async (req, res) => {
  let { limit, offset,pesquisa,centros,mostrarAntingas} = req.query;
  if (!req.query.limit || req.query.limit == 0) {
    limit = 5;
  }
  if (!req.query.offset) {
    offset = 0;
  }
  if(!centros){
    centros = new Array(0)
    const allCentros = await Centro.findAll({attributes:["idcentro"]});
    allCentros.map((x,i)=>{
      centros[i] = Number(x.dataValues.idcentro)
    })
  }
  let data;
  let count;
  if(pesquisa && isValidDate(pesquisa)){
    data = await Reserva
    .scope("noIdUtilizador")
    .findAll({
      limit: limit,
      offset: offset,
      include: [{ 
        model: Sala,
       }, { 
        model: Utilizador.scope("noPassword"),
      }],
      where:{
        [Op.and]:[{
          [Op.or]:[{
            "$reservas.data$":new Date(pesquisa)
          },{
            "$utilizadore.nome$":{[Op.iLike]:"%"+pesquisa+"%"}
          },{
            "$sala.nome$":{[Op.iLike]:"%"+pesquisa+"%"}
          }]
        },{
          "$sala.idcentro$":{[Op.in]: centros}
        }]
        
      },
      order: [["data", "DESC"]],
    });
    count = await Reserva.count({
      include: [{ 
        model: Sala,
       }, { 
        model: Utilizador.scope("noPassword"),
      }],
      where:{
        [Op.and]:[{
          [Op.or]:[{
            "$reservas.data$":new Date(pesquisa)
          },{
            "$utilizadore.nome$":{[Op.iLike]:"%"+pesquisa+"%"}
          },{
            "$sala.nome$":{[Op.iLike]:"%"+pesquisa+"%"}
          }]
        },{
          "$sala.idcentro$":{[Op.in]: centros}
        }]
      }
    });
  }
  else{
    if(!pesquisa)pesquisa=""
    if(mostrarAntingas && (String(mostrarAntingas).toLowerCase() == "false")){
      let today = new Date();
      data = await Reserva
      .scope("noIdUtilizador")
      .findAll({
        limit: limit,
        offset: offset,
        include: [{ 
          model: Sala,
         }, { 
          model: Utilizador.scope("noPassword"),
        }],
        where:{
          [Op.and]:[{
            data:{[Op.gt]:today}
          },{
            [Op.or]:[{
              "$utilizadore.nome$":{[Op.iLike]:"%"+pesquisa+"%"}
            },{
              "$sala.nome$":{[Op.iLike]:"%"+pesquisa+"%"}
            }]
          },{
            "$sala.idcentro$":{[Op.in]: centros}
          }]
        },
        order: [["data", "DESC"]],
      });
      count = await Reserva.count({
        include: [{ 
          model: Sala,
         }, { 
          model: Utilizador.scope("noPassword"),
        }],
        where:{
          [Op.and]:[{
            data:{[Op.gt]:today}
          },{
            [Op.or]:[{
              "$utilizadore.nome$":{[Op.iLike]:"%"+pesquisa+"%"}
            },{
              "$sala.nome$":{[Op.iLike]:"%"+pesquisa+"%"}
            }]
          },{
            "$sala.idcentro$":{[Op.in]: centros}
          }]
        }});
    }
    else{
      data = await Reserva
      .scope("noIdUtilizador")
      .findAll({
        limit: limit,
        offset: offset,
        include: [{ 
          model: Sala,
         }, { 
          model: Utilizador.scope("noPassword"),
        }],
        where:{
          [Op.and]:[{
            [Op.or]:[{
              "$utilizadore.nome$":{[Op.iLike]:"%"+pesquisa+"%"}
            },{
              "$sala.nome$":{[Op.iLike]:"%"+pesquisa+"%"}
            }]
          },{
            "$sala.idcentro$":{[Op.in]: centros}
          }]
        },
        order: [["data", "DESC"]],
      });
      count = await Reserva.count({
        include: [{ 
          model: Sala,
         }, { 
          model: Utilizador.scope("noPassword"),
        }],
        where:{
          [Op.and]:[{
            [Op.or]:[{
              "$utilizadore.nome$":{[Op.iLike]:"%"+pesquisa+"%"}
            },{
              "$sala.nome$":{[Op.iLike]:"%"+pesquisa+"%"}
            }]
          },{
            "$sala.idcentro$":{[Op.in]: centros}
          }]}});
    }

  }
   
  let x = { data };
  
  x.count = count;
  res.send(x);
};
controllers.getReserva = async (req, res) => {
  const data = await Reserva.scope("noIdSala")
    .scope("noIdUtilizador")
    .findByPk(req.params.id, {
      include: [{ model: Sala }, { model: Utilizador }],
    });
  res.json({ data: data });
};
controllers.insertReserva = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const data = await Reserva.create(
      {
        data: req.body.data,
        horainicio: req.body.horainicio,
        horafinal: req.body.horafinal,
        observacoes: req.body.observacoes,
        idutilizador: req.body.idutilizador,
        idsala: req.body.idsala,
      },
      { transaction: t }
    );
    sendUpdateReserva()
    await t.commit();
    res.send({ data: data });
  } catch (err) {
    await t.rollback();
    next(err)
  }
};
controllers.deleteReserva = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const {id} = req.params
    if(isNaN(id)) return createError.BadRequest("Id is not a number")
    await Reserva.destroy({where:{idreserva:id}});
    sendUpdateReserva()
    await t.commit();
    res.sendStatus(204)
  } catch (err) {
    await t.rollback();
    next(err)
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
    sendUpdateReserva()
    await t.commit();
    res.sendStatus(204);
  } catch (error) {
    await t.rollback();
    next(error)
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
    const { start, end } = req.query;
    if (!(start && end)) {
      return next(createError.BadRequest("Date missing"));
    }
    let data = await Reserva.count({
      attributes:['data'],
      as:"value",
      where:{
        data:{[Op.between]:[
          start
        ,
          end
        ]}
      },
      group:"data"
    })
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
                }},{
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
                }},{
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
    let array_sala = [-1]
    Array.map((x, i) => {
        array_sala[i] = x.dataValues.idsala
    })
    return array_sala
}

controllers.freeSalas = async (req, res, next) => {
  try {
    const { data, horainicio, horafinal, centro } = req.query;
    if(!(data && horainicio && horafinal && centro)) return next(createError.BadRequest("Something missing"))
    const salasRemove = await Sala.findAll({
        attributes: ['idsala'],
        include: [{model: Reserva,
            attributes: [],
            where: {
                data: data,
                [Op.or]: [
                    {
                      [Op.and]: [
                        {
                          horafinal: {
                            [Op.lte]: horafinal,
                          }},{
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
                          }},{
                          horainicio: {
                            [Op.gte]: horainicio,
                          },
                        },
                      ],
                    },
                  ],
            }
        }]
    });

    const salas = await Sala.findAll({
        where:{
            idsala:{[Op.notIn]:[Returnsalas(salasRemove)]},
            idcentro:centro
        }
    })
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
      where:{
        data:{[Op.between]: [new Date(start),new Date(end)]} 
      },
      include:[{
        model:Sala,
        where:{
          idsala:sala
        },
        attributes:[]
      }]
    })
    res.send({ data: val });
  } catch (error) {
    next(error);
  }
};

controllers.reservasDecorrer = async (req, res, next) => {
  try {
    let now = new Date()
    let time = now.getHours() + ":"+ now.getMinutes()+":"+now.getSeconds();
    const data = await Reserva.findAll({
      where: {
            [Op.and]: [
              {
                horafinal:{[Op.gte]:time}
              },{
                horainicio: {
                  [Op.lte]: time,
                },
              },{
                data:now
              },{
                [Op.not]:[{
                  horafinal:{[Op.lte]:time}
                }]
                
              }
            ],
      },
      include: [
        {
          model: Sala,
        },
      ],
    });
    res.send({ data });
  } catch (error) {
    next(error);
  }
};

module.exports = controllers;
