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
    horainicio: {type:Sequelize.DATE,allowNull: false},
    horafinal: {type:Sequelize.DATE,allowNull: false},
    observacoes: Sequelize.TEXT
}, {
    freezeTableName: true,
    timestamps: false,
});
module.exports = Reserva