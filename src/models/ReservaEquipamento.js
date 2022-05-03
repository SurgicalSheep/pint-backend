var Sequelize = require('sequelize');
var sequelize = require('./database');
const Reserva = require('./Reserva')
const Equipamento = require('./Equipamento')

var ReservaEquipamento = sequelize.define('reservas_equipamentos', {}, 
{
    freezeTableName: true,
    timestamps: false,
});

module.exports = ReservaEquipamento