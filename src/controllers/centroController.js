const controllers = {}
var Centro = require('../models/Centro');
var sequelize = require('../models/Database');
const Sequelize = require("sequelize");
const { request } = require('express');
const Op = Sequelize.Op;
sequelize.sync()

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
    if(req.body.estado !== "1" && req.body.estado !=="0"){
        res.status(400).send("Err")
    }else{
        const id = req.params.id;
        
        const result = await Centro.update(req.body,
            { where: { idcentro: id } })
        res.status(200).send("1")
    }
};
controllers.insertCentro = async(req, res) => {
    if(req.body.estado !== "1" && req.body.estado !== "0"){
        res.status(400).send("Err")
    }else{
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
            res.send(err)
        })
        res.status(200).send("1")
    }
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
        res.status(200)
        
    }catch{
        res.status(200)
    }
};

module.exports = controllers;