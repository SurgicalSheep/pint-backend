var Sequelize = require('sequelize');
var sequelize = require('./database');
const Utilizador = require('./Utilizador');
const Sala = require('./Sala');

var Reserva = sequelize.define('reservas', {
    idreserva: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    data: {type:Sequelize.DATE,allowNull: false},
    horainicio: {type:Sequelize.TIME,allowNull: false},
    horafinal: {type:Sequelize.TIME,allowNull: false},
    observacoes: Sequelize.TEXT
}, {
    freezeTableName: true,
    timestamps: false,
    scopes: {
        noIdSala: {
          attributes: { exclude: ["idsala"] },
        },
        noIdUtilizador: {
            attributes: { exclude: ["idutilizador"] },
          }
    }
});
module.exports = Reserva