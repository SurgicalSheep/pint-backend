const {NOW } = require("sequelize");
var Sequelize = require("sequelize");
var sequelize = require("./database");
const Utilizador = require("./Utilizador")

var Notificacao = sequelize.define(
  "notificacacoes",
  {
    idnotificacao: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titulo: {type:Sequelize.STRING,allowNull: true},
    descricao: {type:Sequelize.STRING,allowNull: false},
    hora: {type:Sequelize.DATE,allowNull: false,defaultValue: NOW()},
    recebida: {type:Sequelize.BOOLEAN,allowNull: false,defaultValue: 1}
  },
  {
    freezeTableName: true,
    timestamps: false
  }
);
Notificacao.belongsTo(Utilizador,{foreignKey:'idutilizador'})
Utilizador.hasMany(Notificacao,{foreignKey:'idutilizador'})

module.exports = Notificacao;
