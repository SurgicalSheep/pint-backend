const {NOW } = require("sequelize");
var Sequelize = require("sequelize");
var sequelize = require("./database");
const Utilizador = require("./Utilizador")

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
    hora: {type:Sequelize.DATE,allowNull: false,defaultValue: NOW()},
    recebida: {type:Sequelize.BOOLEAN,allowNull: false,defaultValue: 1}
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
Notificacao.belongsTo(Utilizador,{foreignKey:'idutilizador',as:'utilizador'})
Utilizador.hasMany(Notificacao,{foreignKey:'idutilizador',as:'utilizador'})

module.exports = Notificacao;
