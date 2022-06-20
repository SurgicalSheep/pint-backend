const controllers = {};
var EmpregadoManutencao = require("../models/EmpregadoManutencao");
var Utilizador = require("../models/utilizador")
var sequelize = require("../models/Database");
const Sequelize = require("sequelize");
const Centro = require("../models/Centro");
const Op = Sequelize.Op;

controllers.list = async (req, res) => {
  const data = await EmpregadoManutencao.findAll({
    where:{}
  });
  res.json(data);
};
controllers.editEmpregadoManutencao = async(req, res) => {
  try {
      const id = req.params.id;
      
      await EmpregadoManutencao.update(req.body,
          { where: { idutilizador: id } })
      res.status(200).send("1")
  } catch (error) {
      res.status(400).send(error)
  }
};
controllers.insertEmpregadoManutencao = async(req, res) => {
  try {
    await sequelize.sync().then(()=>
       {
        EmpregadoManutencao.create(req.body)
       })
       res.status(200).send("1")
  } catch (error) {
   res.status(400).send(error)
  }
};

controllers.deleteEmpregadoManutencao = async(req, res) => {
  const id = req.params.id;
  const data = await EmpregadoManutencao.findOne({
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
controllers.getEmpregadoManutencao = async (req, res) => {
  const id = req.params.id;
  const data = await EmpregadoManutencao.findOne({
      where:{
        idutilizador:{
              [Op.eq]:id
          }
      }
  })
  res.json(data);
};
controllers.bulkInsertEmpregadoManutencao = async(req, res) => {
    try {
        await sequelize.sync().then(()=>
         {
            EmpregadoManutencao.bulkCreate(req.body)
             
         }).catch((err)=>{
             res.status(400).send(err)
         })
         res.status(200).send("1")
    } catch (error) {
     res.status(400).send(error)
    }
  };
  controllers.getEmpregadosManutencaoCentro = async (req, res) => {
    const data = await EmpregadoManutencao.scope("noPassword").scope("noIdCentro").findAll({
        where:{},
        include:[{
            model:Centro,
            required:true,
            where:{},
        }]
    })
    res.json(data);
  };
  controllers.getEmpregadoManutencaoCentro = async (req, res) => {
    const data = await EmpregadoManutencao.scope("noPassword").scope("noIdCentro").findOne({
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
