const controllers = {};
var Utilizador = require("../models/Utilizador");
var sequelize = require("../models/Database");
const Sequelize = require("sequelize");
const Centro = require("../models/Centro");
const Op = Sequelize.Op;
sequelize.sync();

controllers.list = async (req, res) => {
  const data = await Utilizador.scope("noPassword").scope("noIdCentro").findAll({
      include:[{
          model:Centro
      }]
  });
  res.json(data);
};
controllers.editUtilizador = async(req, res) => {
  try {
      const id = req.params.id;
      
      await Utilizador.update(req.body,
          { where: { idsala: id } })
      res.status(200).send("1")
  } catch (error) {
      res.status(400).send(error)
  }
};
controllers.insertUtilizador = async(req, res) => {
  try {
      await sequelize.sync().then(()=>
       {
           Utilizador.create(req.body)
           
       }).catch((err)=>{
           res.status(400).send(err)
       })
       res.status(200).send("1")
  } catch (error) {
   res.status(400).send(error)
  }
};

controllers.deleteUtilizador = async(req, res) => {
  const id = req.params.id;
  const data = await Utilizador.findOne({
      where:{
          idutilizador:{
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
controllers.getUtilizador = async (req, res) => {
  const id = req.params.id;
  const data = await Utilizador.scope("noPassword").findOne({
      where:{
        idutilizador:{
              [Op.eq]:id
          }
      }
  })
  res.json(data);
};
controllers.bulkInsertUtilizador = async(req, res) => {
    try {
        await sequelize.sync().then(()=>
         {
             Utilizador.bulkCreate(req.body)
             
         }).catch((err)=>{
             res.status(400).send(err)
         })
         res.status(200).send("1")
    } catch (error) {
     res.status(400).send(error)
    }
  };
  controllers.getUtilizadorCentro = async (req, res) => {
    //const id = req.params.id;
    const data = await Utilizador.scope("noPassword").findAll({
        where:{},
        include:[{
            model:Centro,
            required:true,
            where:{},
        }]
    })
    res.json(data);
  };
module.exports = controllers;
