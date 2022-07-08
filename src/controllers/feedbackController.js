const controllers = {}
var Feedback = require('../models/feedback');
var sequelize = require('../models/database');
const Sequelize = require("sequelize");
const Utilizador = require('../models/utilizador')
const Sala = require('../models/sala')
const Centro = require('../models/centro')
const { request } = require('express');
const Op = Sequelize.Op;

controllers.list = async(req, res) => {
    let {limit,offset} = req.query
    if (!limit || limit == 0) {
        limit = 5;
      }
      if (!offset) {
        offset = 0;
      }
    const data = await Feedback.scope("noIdUtilizador").scope("noIdSala").findAll({
        limit,
        offset,
        include: [
          { model: Utilizador,as:'utilizadores'},
          { model: Sala},
        ],
    });
    res.json({data:data})
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
    res.json({data:data});
};
controllers.insertFeedback = async(req, res) => {
    const t = await sequelize.transaction();
    try{
        const data = await Feedback.create({
        idsala:req.body.idsala,
        idutilizador:req.body.idutilizador,
        classificacao:req.body.classificacao,
        comentario:req.body.comentario,
        idreserva:req.body.idreserva,
        criado_em:req.body.criado_em
    },{transaction:t});
         await t.commit()
         const io = req.app.get('socketio');
        io.emit('newFeedback',{data:data})
         res.status(200).send({data:data})
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
        const io = req.app.get('socketio');
        io.emit('feedbackUpdated',"feedbackUpdated")
        res.status(200).send("1")
    } catch (error) {
        await t.rollback()
        res.status(400).send(error)
    }
        
    
};
module.exports = controllers;