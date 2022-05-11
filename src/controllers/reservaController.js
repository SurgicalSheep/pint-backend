const controllers = {}
var Utilizador = require('../models/Utilizador');
var Sala = require('../models/Sala');
var Reserva = require('../models/Reserva');
var sequelize = require('../models/Database');
const Sequelize = require("sequelize");
const { request } = require('express');
const Op = Sequelize.Op;

controllers.list = async(req, res) => {
    const data = await Reserva.scope("noIdSala").scope("noIdUtilizador").findAll({
        include:[{model:Sala},{model:Utilizador}]
    });
    res.json({reservas:data})
}
controllers.getReserva = async (req, res) => {
    const data = await Reserva.scope("noIdSala").scope("noIdUtilizador").findByPk(req.params.id,{
        include:[{model:Sala},{model:Utilizador}],
    })
    res.json(data);
};
controllers.insertReserva = async(req, res) => {
    const t = await sequelize.transaction();
    try{
        await Reserva.create({
        data:req.body.data,
        horainicio:req.body.horainicio,
        horafinal:req.body.horafinal,
        observacoes:req.body.observacoes,
        idutilizador:req.body.idutilizador,
        idsala:req.body.idsala
    },{transaction:t});
         await t.commit()
         res.status(200).send("1")
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

module.exports = controllers;