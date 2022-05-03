var Sequelize = require("sequelize");
var sequelize = require("./database");
const Utilizador = require("./Utilizador")
const Notificacao = require("./Notificacao")

var Utilizadores_Notificaco = sequelize.define(
  "utilizadores_notificacoes",
  {},
  {
    freezeTableName: true,
    timestamps: false
  }
);
module.exports = Utilizadores_Notificaco;
