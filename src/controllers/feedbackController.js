const controllers = {}
var Feedback = require('../models/Feedback');
var sequelize = require('../models/Database');
const Sequelize = require("sequelize");
const Utilizador = require('../models/Utilizador')
const Sala = require('../models/Sala')
const Centro = require('../models/Centro')
const { request } = require('express');
const Op = Sequelize.Op;
sequelize.sync()

controllers.list = async(req, res) => {
    const data = await Feedback.scope("noIdUtilizador").scope("noIdSala").findAll({
        include: [
          { model: Utilizador,as:'utilizadores'},
          { model: Sala},
        ],
    });
    res.json(data)
}
controllers.getFeedback = async (req, res) => {
    const id = req.params.id;
    const data = await Feedback.findOne({
        where:{
            idfeedback:{
                [Op.eq]:id
            }
        }
    })
    res.json(data);
};
controllers.insertFeedback = async(req, res) => {
    const t = await sequelize.transaction();
    try{
        await Feedback.create({
        idsala:req.body.idsala,
        idutilizador:req.body.idutilizador,
        classificacao:req.body.classificacao,
        comentario:req.body.comentario,
        idreserva:req.body.idreserva,
        criado_em:req.body.criado_em
    },{transaction:t});
         await t.commit()
         res.status(200).send("1")
    }catch{
        await t.rollback()
        res.status(400).send(err)
    }
};
controllers.deleteFeedack = async(req, res) => {
    const t = await sequelize.transaction();
    try{
        await Feedback.destroy({
            where:{
                idfeedback:req.params.id
            }
        })

        await t.commit();
        res.status(200).send("1")
    }catch{
        await t.rollback();
        res.status(400).send("Err")
    }
};
controllers.editFeedback = async(req, res) => {
    const t = await sequelize.transaction();
    try {
        await Feedback.update({
            idsala:req.body.idsala,
            idutilizador:req.body.idutilizador,
            classificacao:req.body.classificacao,
            comentario:req.body.comentario,
            idreserva:req.body.idreserva,
            criado_em:req.body.criado_em
        },{ where: { idfeedback: req.params.id },transaction:t})
        await t.commit()
        res.status(200).send("1")
    } catch (error) {
        await t.rollback()
        res.status(400).send(error)
    }
        
    
};
module.exports = controllers;