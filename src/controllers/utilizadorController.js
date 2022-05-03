const controllers = {};
var Utilizador = require("../models/Utilizador");
var sequelize = require("../models/Database");
const Sequelize = require("sequelize");
const Centro = require("../models/Centro");
const Op = Sequelize.Op;

controllers.list = async (req, res) => {
  const data = await Utilizador.scope("noPassword").scope("noIdCentro").findAll({
      include:[{
          model:Centro
      }]
  });
  res.json(data);
};
controllers.editUtilizador = async(req, res) => {
    const t = await sequelize.transaction();
    try {
      await Utilizador.update({
          ncolaborador:req.body.ncolaborador,
          admin:req.body.admin,
          nome:req.body.nome,
          idcentro:req.body.idcentro,
          telemovel:req.body.telemovel,
          email:req.body.email,
          password:req.body.password,
          estado:req.body.estado,
          firstlogin:req.body.firstlogin,
          verificado:req.body.verificado,
          token:req.body.token,
          foto:req.body.foto
    },{ where: { idsala: req.params.id },transaction:t })
        await t.commit()
        res.status(200).send("1")
    } catch (err) {
        await t.rollback()
        res.status(400).send("Err")
  }
};
controllers.insertUtilizador = async(req, res) => {
    const t = await sequelize.transaction();
    try {
        await Utilizador.create({
            ncolaborador:req.body.ncolaborador,
            admin:req.body.admin,
            nome:req.body.nome,
            idcentro:req.body.idcentro,
            telemovel:req.body.telemovel,
            email:req.body.email,
            password:req.body.password,
            estado:req.body.estado,
            firstlogin:req.body.firstlogin,
            verificado:req.body.verificado,
            token:req.body.token,
            foto:req.body.foto
      },{transaction:t})  
        await t.commit()
        res.status(200).send("1")
    } catch (error) {
        await t.rollback()
        res.status(400).send(error)
    }
};

controllers.deleteUtilizador = async(req, res) => {
  const t = await sequelize.transaction();
  try{
    await Utilizador.destroy(
        { where: { idutilizador: req.params.id } },
        { transaction: t }
      )
      await t.commit()
      res.status(200).send("1")
  }catch{
      await t.rollback()
      res.status(400).send("Err")
  }
};
controllers.getUtilizador = async (req, res) => {
  const data = await Utilizador.scope("noPassword").findByPk(req.params.id)
  res.json(data);
};
controllers.bulkInsertUtilizador = async(req, res) => {
    const t = await sequelize.transaction();
    try {
        await Utilizador.bulkCreate(req.body,{transaction:t})
        await t.commit()
        res.status(200).send("1")
    } catch (error) {
        await t.rollback()
     res.status(400).send(error)
    }
  };
module.exports = controllers;
