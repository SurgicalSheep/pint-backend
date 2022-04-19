const {NOW } = require("sequelize");
var Sequelize = require("sequelize");
var sequelize = require("./database");
const Utilizador = require("./Utilizador")
const Notificacao = require("./Notificacao")

var Utilizadores_Notificaco = sequelize.define(
  "Utilizadores_Notificacoes",
  {},
  {
    freezeTableName: true,
    timestamps: false
  }
);
Notificacao.belongsToMany(Utilizador,{through:Utilizadores_Notificaco})
Utilizador.belongsToMany(Notificacao,{through:Utilizadores_Notificaco})

module.exports = Utilizadores_Notificaco;
