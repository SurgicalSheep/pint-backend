const controllers = {};
var EmpregadoLimpeza = require("../models/EmpregadoLimpeza");
var Utilizador = require("../models/Utilizador")
var sequelize = require("../models/Database");
const Sequelize = require("sequelize");
const Centro = require("../models/Centro");
const Op = Sequelize.Op;

controllers.list = async (req, res) => {
  const data = await EmpregadoLimpeza.findAll({
    where:{}
  });
  res.json(data);
};
controllers.editEmpregadoLimpeza = async(req, res) => {
  try {
      const id = req.params.id;
      
      await EmpregadoLimpeza.update(req.body,
          { where: { idutilizador: id } })
      res.status(200).send("1")
  } catch (error) {
      res.status(400).send(error)
  }
};
controllers.insertEmpregadoLimpeza = async(req, res) => {
  try {
    await sequelize.sync().then(()=>
       {
          EmpregadoLimpeza.create(req.body)
       })
       res.status(200).send("1")
  } catch (error) {
   res.status(400).send(error)
  }
};

controllers.deleteEmpregadoLimpeza = async(req, res) => {
  const id = req.params.id;
  const data = await EmpregadoLimpeza.findOne({
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
controllers.getEmpregadoLimpeza = async (req, res) => {
  const id = req.params.id;
  const data = await EmpregadoLimpeza.findOne({
      where:{
        idutilizador:{
              [Op.eq]:id
          }
      }
  })
  res.json(data);
};
controllers.bulkInsertEmpregadoLimpeza = async(req, res) => {
    try {
        await sequelize.sync().then(()=>
         {
          EmpregadoLimpeza.bulkCreate(req.body)
             
         }).catch((err)=>{
             res.status(400).send(err)
         })
         res.status(200).send("1")
    } catch (error) {
     res.status(400).send(error)
    }
  };
  controllers.getEmpregadosLimpezaCentro = async (req, res) => {
    const data = await EmpregadoLimpeza.scope("noPassword").scope("noIdCentro").findAll({
        where:{},
        include:[{
            model:Centro,
            required:true,
            where:{},
        }]
    })
    res.json(data);
  };
  controllers.getEmpregadoLimpezaCentro = async (req, res) => {
    const data = await EmpregadoLimpeza.scope("noPassword").scope("noIdCentro").findOne({
        where:{
          idutilizador:{
          [Op.eq]:req.params.id
      }},
        include:[{
            model:Centro,
            required:true,
            where:{},
        }]
    })
    res.json(data);
  };
module.exports = controllers;
