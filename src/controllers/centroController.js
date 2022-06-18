const controllers = {}
var Centro = require('../models/centro');
var sequelize = require('../models/database');
const Sequelize = require("sequelize");
const Utilizador = require('../models/utilizador');
const Sala = require('../models/sala');

controllers.list = async(req, res) => {
    const data = await Centro.findAll();
    res.json({data:data});

}
controllers.getCentro = async (req, res) => {
    let id = req.params.id
    if(Number.isInteger(+id)){
        const data = await Centro.findOne({
            where:{
                idcentro:id
            }
        })
        res.json({data:data});
    }
    else{
        res.status("422").send("Id is not an Integer!")
    }
    
};  
controllers.editCentro = async(req, res) => {
    let id = req.params.id
    if(Number.isInteger(+id)){
        const t = await sequelize.transaction();
        try {
            await Centro.update({
                nome:req.body.nome,
                cidade:req.body.cidade,
                endereco:req.body.endereco,
                imagem:req.body.imagem,
                descricao:req.body.descricao,
                estado:req.body.estado
            },
            { where: { idcentro: req.params.id },transaction:t})
            await t.commit()
            res.status(200).send("Ok")
        } catch (error) {
            await t.rollback()
            res.status(400).send(error)
        } 
    }else{
        res.status("422").send("Id is not an Integer!")
    }
};
controllers.insertCentro = async(req, res) => {
    const t = await sequelize.transaction();
    try {
        await Centro.create({
            nome:req.body.nome,
            cidade:req.body.cidade,
            endereco:req.body.endereco,
            imagem:req.body.imagem,
            descricao:req.body.descricao,
            estado:req.body.estado
        },{transaction:t})
        await t.commit()
        res.status(200).send("Ok")
    } catch (error) {
        await t.rollback()
        res.status(400).send(error)
    }

};
controllers.deleteCentro = async(req, res) => {
    let id = req.params.id;
    if(Number.isInteger(+id)){
        const t = await sequelize.transaction();
        try {
            await Centro.destroy({
            where:{idcentro:id}},{transaction:t})
            await t.commit()
            res.status(200).send("Ok")
        } catch (error) {
            res.status(400).send(error)
        }  
    }else{
        res.status("422").send("Id is not an Integer!")
    }

};
controllers.getSalasCentro = async (req, res) => {
    let id = req.params.id;
    if(Number.isInteger(+id)){
    const data = await Centro.findAll({
        where:{idcentro:id},
        include:[{
            model:Sala.scope("noIdCentro"),
            where:{}
        }]
    })
    res.json({data:data});
    }else{
        res.status("422").send("Id is not an Integer!")
    }

  };
module.exports = controllers;
