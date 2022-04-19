const controllers = {}
var Pedido = require('../models/Pedido');
var sequelize = require('../models/Database');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
sequelize.sync()

controllers.list = async(req, res) => {
    const data = await Pedido.findAll();
    res.json(data)
}
controllers.getPedido = async (req, res) => {
    const id = req.params.id;
    const data = await Pedido.findOne({
        where:{
            idpedido:{
                [Op.eq]:id
            }
        }
    })
    res.json(data);
};
controllers.insertPedido = async(req, res) => {
        await sequelize.sync().then(()=>
        {
            Pedido.create(req.body).then(x =>{
                console.log(x)
            })
            
        }).catch((err)=>{
            res.status(400).send(err)
        })
        res.status(200).send("1")
};
controllers.deletePedido = async(req, res) => {
    const id = req.params.id;
    const data = await Pedido.findOne({
        where:{
            idnpedido:{
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
controllers.editPedido = async(req, res) => {
    try {
        const id = req.params.id;
        
        await Pedido.update(req.body,
            { where: { idpedido: id } })
        res.status(200).send("1")
    } catch (error) {
        res.status(400).send(error)
    }
        
    
};
module.exports = controllers;