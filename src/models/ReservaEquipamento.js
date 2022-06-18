var Sequelize = require('sequelize');
var sequelize = require('./database');
const Reserva = require('./reserva')
const Equipamento = require('./equipamento')

var ReservaEquipamento = sequelize.define('reservas_equipamentos', {}, 
{
    freezeTableName: true,
    timestamps: false,
});

module.exports = ReservaEquipamento