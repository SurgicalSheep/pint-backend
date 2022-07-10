var Sequelize = require("sequelize");
var sequelize = require("./database");
const Utilizador = require("./utilizador")
const Notificacao = require("./notificacao")

var Utilizadores_Notificaco = sequelize.define(
  "utilizadores_notificacoes",
  {
    recebida: {type:Sequelize.BOOLEAN,allowNull: false,defaultValue: false}
  },
  {
    freezeTableName: true,
    timestamps: false
  }
);
module.exports = Utilizadores_Notificaco;
