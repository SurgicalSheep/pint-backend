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
    const data = await Feedback.findAll();
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
        await sequelize.sync().then(()=>
        {
            Feedback.create(req.body)
            
        }).catch((err)=>{
            res.status(400).send(err)
        })
        res.status(200).send("1")
};
controllers.deleteFeedack = async(req, res) => {
    const id = req.params.id;
    const data = await Notificacao.findOne({
        where:{
            idnotificacao:{
                [Op.eq]:id
            }
        }
    })
    try{
        data.destroy()
        res.status(200).send("1")
        
    }catch{
        res.status(400).send("Err")
    }
};
controllers.editFeedback = async(req, res) => {
    try {
        const id = req.params.id;
        
        await Feedback.update(req.body,
            { where: { idfeedback: id } })
        res.status(200).send("1")
    } catch (error) {
        res.status(400).send(error)
    }
        
    
};
module.exports = controllers;