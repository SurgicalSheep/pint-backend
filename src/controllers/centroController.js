const controllers = {}
var Centro = require('../models/Centro');
var sequelize = require('../models/Database');
const Sequelize = require("sequelize");
const { request } = require('express');
const Utilizador = require('../models/Utilizador');
const Op = Sequelize.Op;

controllers.list = async(req, res) => {
    const data = await Centro.findAll();
    res.json(data)
}
controllers.getCentro = async (req, res) => {
    const id = req.params.id;
    const data = await Centro.findOne({
        where:{
            idcentro:{
                [Op.eq]:id
            }
        }
    })
    res.json(data);
};
controllers.editCentro = async(req, res) => {
        const id = req.params.id;
        
        await Centro.update(req.body,
            { where: { idcentro: id } })
        res.status(200).send("1")
    
};
controllers.insertCentro = async(req, res) => {
        await sequelize.sync().then(()=>
        {
            Centro.create({
                nome:req.body.nome,
                cidade:req.body.cidade,
                endereco:req.body.endereco,
                imagem:req.body.imagem,
                descricao:req.body.descricao,
                estado:req.body.estado
            })
            
        }).catch((err)=>{
            res.status(400).send(err)
        })
        res.status(200).send("1")
};
controllers.deleteCentro = async(req, res) => {
    const id = req.params.id;
    const data = await Centro.findOne({
        where:{
            idcentro:{
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
controllers.getUtilizadorCentro = async (req, res) => {
    //const id = req.params.id;
    const data = await Centro.findAll({
        where:{},
        include:[{
            model:Utilizador.scope("noPassword"),
            where:{}
        }]
    })
    res.json(data);
  };
module.exports = controllers;