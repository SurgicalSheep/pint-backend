const controllers = {}
var Centro = require('../models/Centro');
var Sala = require('../models/Sala');
var sequelize = require('../models/Database');
const Sequelize = require("sequelize");
const { request } = require('express');
const Op = Sequelize.Op;

controllers.list = async(req, res) => {
    const data = await Sala.findAll();
    res.json({salas:data})
}
controllers.getSala = async (req, res) => {
    const id = req.params.id;
    const data = await Sala.findOne({
        where:{
            idsala:{
                [Op.eq]:id
            }
        }
    })
    res.json(data);
};
controllers.editSala = async(req, res) => {
    try {
        const id = req.params.id;
        
        const result = await Sala.update(req.body,
            { where: { idsala: id } })
        res.status(200).send("1")
    } catch (error) {
        res.status(400).send(error)
    }
        
    
};
controllers.insertSala = async(req, res) => {
   try {
       await sequelize.sync().then(()=>
        {
            Sala.create(req.body)
            
        }).catch((err)=>{
            res.status(400).send(err)
        })
        res.status(200).send("1")
   } catch (error) {
    res.status(400).send(error)
   }
        
    
};
controllers.deleteSala = async(req, res) => {
    const id = req.params.id;
    const data = await Sala.findOne({
        where:{
            idsala:{
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

module.exports = controllers;