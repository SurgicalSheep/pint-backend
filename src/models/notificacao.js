const {NOW } = require("sequelize");
var Sequelize = require("sequelize");
var sequelize = require("./database");

var Notificacao = sequelize.define(
  "notificacoes",
  {
    idnotificacao: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titulo: {type:Sequelize.STRING,allowNull: true},
    descricao: {type:Sequelize.STRING,allowNull: false},
    hora: {type:Sequelize.DATE,allowNull: false,defaultValue: NOW()}
  },
  {
    freezeTableName: true,
    timestamps: false,
    scopes: {
      noIdUtilizador: {
        attributes: { exclude: ["idutilizador"] },
      },
    },
  }
);

module.exports = Notificacao;
