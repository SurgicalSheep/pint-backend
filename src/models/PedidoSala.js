var Sequelize = require('sequelize');
var sequelize = require('./database');
const Pedido = require('./Pedido')
const Sala = require('./Sala')

var PedidoSala = sequelize.define('pedidos_salas', {}, 
{
    freezeTableName: true,
    timestamps: false,
});

Pedido.belongsToMany(Sala, { through: PedidoSala });
Sala.belongsToMany(Pedido, { through: PedidoSala });

module.exports = PedidoSala