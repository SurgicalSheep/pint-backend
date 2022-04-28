var Sequelize = require('sequelize');
var sequelize = require('./database');
var Utilizador = require('./Utilizador')
var Sala = require('./Sala')
var Reserva = require('./Reserva');
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

Feedback.belongsTo(Utilizador,{foreignKey:'idutilizador',allowNull:false,as:'utilizadores'})
Feedback.belongsTo(Sala,{foreignKey:'idsala',allowNull:true})
Feedback.belongsTo(Reserva,{foreignKey:'idreserva',allowNull:true})
module.exports = Feedback