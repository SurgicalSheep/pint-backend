const controllers = {}
var Equipamento = require('../models/Equipamento');
var sequelize = require('../models/Database');
const Sequelize = require("sequelize");
const Sala = require('../models/Sala')
const { request } = require('express');
const Op = Sequelize.Op;

controllers.list = async(req, res) => {
    const data = await Equipamento.findAll();
    res.json(data)
}
controllers.getEquipamento = async (req, res) => {
    const id = req.params.id;
    const data = await Equipamento.findOne({
        where:{
            idequipamento:{
                [Op.eq]:id
            }
        }
    })
    res.json(data);
};
controllers.editEquipamento = async(req, res) => {
        const id = req.params.id;
        
        await Equipamento.update(req.body,
            { where: { idequipamento: id } })
        res.status(200).send("1")
    
};
controllers.insertEquipamento = async(req, res) => {
        await sequelize.sync().then(()=>
        {
            Equipamento.create(req.body)
            
        }).catch((err)=>{
            res.status(400).send(err)
        })
        res.status(200).send("1")
};
controllers.deleteEquipamento = async(req, res) => {
    const id = req.params.id;
    const data = await Equipamento.findOne({
        where:{
            idequipamento:{
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

controllers.getEquipamentosSalas = async (req, res) => {
    //const id = req.params.id;
    const data = await Equipamento.findAll({
        where:{},
        include:[{
            model:Sala,
            required:true,
            where:{},
        }]
    })
    res.json(data);
  };

module.exports = controllers;