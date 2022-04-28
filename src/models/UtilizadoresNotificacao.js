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
Notificacao.belongsToMany(Utilizador,{through:Utilizadores_Notificaco,foreignKey:'idnotificacao',onDelete: 'CASCADE'})
Utilizador.belongsToMany(Notificacao,{through:Utilizadores_Notificaco,foreignKey:'idutilizador',onDelete: 'CASCADE'})

module.exports = Utilizadores_Notificaco;
