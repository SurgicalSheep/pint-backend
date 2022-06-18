var Sequelize = require('sequelize');
var sequelize = require('./database');
var Utilizador = require('./utilizador')
var Sala = require('./sala')
var Reserva = require('./reserva');
const {NOW } = require("sequelize");

var Feedback = sequelize.define('feedbacks', {
    idfeedback: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    classificacao: {type:Sequelize.INTEGER,allowNull: false},
    comentario: {type:Sequelize.STRING,allowNull: true},
    criado_em: {type:Sequelize.DATE,allowNull: false,defaultValue: NOW()}
}, {
    freezeTableName: true,
    timestamps: false,
    scopes: {
        noIdUtilizador: {
          attributes: { exclude: ["idutilizador"] },
        },
        noIdSala: {
            attributes: { exclude: ["idsala"] },
          },
      },
});

module.exports = Feedback