const controllers = {}
var Utilizador = require('../models/utilizador');
var Sala = require('../models/sala');
var Reserva = require('../models/reserva');
var sequelize = require('../models/database');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const {searchNotificacaoSchema} = require('../schemas/reservaSchema')

controllers.list = async(req, res) => {
    let {limit,offset} = req.query;
  if(!req.query.limit || req.query.limit == 0){
    limit = 5;
  }
  if(!req.query.offset){
    offset = 0;
  }
    const data = await Reserva.scope("noIdSala").scope("noIdUtilizador").findAll({
        limit:limit,
        offset:offset,
        include:[{model:Sala},{model:Utilizador.scope("noPassword")}],
        order: [
            ['data', 'DESC'],
        ],
    });
    let x = {data};
    const count = await Reserva.count();   
    x.count = count;
    res.send(x)
}
controllers.getReserva = async (req, res) => {
    const data = await Reserva.scope("noIdSala").scope("noIdUtilizador").findByPk(req.params.id,{
        include:[{model:Sala},{model:Utilizador}],
    })
    res.json({data:data});
};
controllers.insertReserva = async(req, res) => {
    const t = await sequelize.transaction();
    try{
        const data = await Reserva.create({
        data:req.body.data,
        horainicio:req.body.horainicio,
        horafinal:req.body.horafinal,
        observacoes:req.body.observacoes,
        idutilizador:req.body.idutilizador,
        idsala:req.body.idsala
    },{transaction:t});
         await t.commit()
         res.status(200).send({data:data})
    }catch(err){
        await t.rollback()
        res.status(400).send(err)
    }
};
controllers.deleteReserva = async(req, res) => {
    const t = await sequelize.transaction();
    try{
        const reserva = await Reserva.findByPk(req.params.id);
        await reserva.destroy({transaction:t})

        await t.commit();
        res.status(200).send("1")
    }catch(err){
        await t.rollback();
        res.status(400).send(err)
    }
};

controllers.editReserva = async(req, res) => {
    const t = await sequelize.transaction();
    try {
        await Reserva.update({
            data:req.body.data,
            horainicio:req.body.horainicio,
            horafinal:req.body.horafinal,
            observacoes:req.body.observacoes,
            idutilizador:req.body.idutilizador,
            idsala:req.body.idsala
        },{ where: { idreserva: req.params.id },transaction:t})
        await t.commit()
        res.status(200).send("1")
    } catch (error) {
        await t.rollback()
        res.status(400).send(error)
    }
};

controllers.searchReservas = async(req, res, next) => {
    try {
        const result = await searchNotificacaoSchema.validateAsync(req.query);
        console.log(result)
        const data = await Reserva.findAll({
            where:{
                [Op.and]:[{data:result.data},{idsala:result.idsala}]
            }
        })
        res.send({data:data})
    } catch (error) {
        next(error)
    }
};

module.exports = controllers;