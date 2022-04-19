const controllers = {}
var Notificacao = require('../models/Notificacao');
var sequelize = require('../models/Database');
const Sequelize = require("sequelize");
const Utilizador = require('../models/Utilizador')
const { request } = require('express');
const Op = Sequelize.Op;
sequelize.sync()

controllers.list = async(req, res) => {
    const data = await Notificacao.findAll();
    res.json(data)
}
controllers.getNotificacao = async (req, res) => {
    const id = req.params.id;
    const data = await Notificacao.findOne({
        where:{
            idnotificacao:{
                [Op.eq]:id
            }
        }
    })
    res.json(data);
};
controllers.insertNotificacao = async(req, res) => {
        await sequelize.sync().then(()=>
        {
            Notificacao.create(req.body)
            
        }).catch((err)=>{
            res.status(400).send(err)
        })
        res.status(200).send("1")
};
controllers.deleteNotificacao = async(req, res) => {
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

controllers.getNotificacoesUtilizador = async (req, res) => {
    //const id = req.params.id;
    const data = await Notificacao.findAll({
        where:{},
        include:[{
            model:Utilizador,
            required:true,
            where:{},
        }]
    })
    res.json(data);
  };

module.exports = controllers;