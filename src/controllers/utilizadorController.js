const controllers = {};
var Utilizador = require("../models/Utilizador");
var sequelize = require("../models/Database");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
sequelize.sync();
controllers.test = (req, res) => {
  const data = {
    name: "Nuno Costa",
    age: 42,
    city: "Viseu",
  };
  console.log("Envio de dados do Controlador utilizador.");
  res.json(data);
};
controllers.testdata = async (req, res) => {
  const response = await sequelize
    .sync()
    .then(function () {
      // APAGAR após a primeira EXECUÇÃO
      // Cria Utilizador
      Utilizador.create({
        nome: "Nuno Costa joao antonio da pizza de paris",
        datanascimento: "1992-01-03",
        telemovel: "232480533",
        email: "bonjour@estgv.ipv.pt",
        password: "123123",
      });

      const data = Utilizador.findAll();
      return data;
    })
    .catch((err) => {
      return err;
    });
  res.json(response);
};
controllers.list = async (req, res) => {
  const params = req.query["id"];
  const data = await Utilizador.scope("noPassword").findAll({
    where: {
      nome: {
        [Op.like]: params ? params + "%" : "%" ,
      },
    },
  });
  res.json(data);
};
module.exports = controllers;
