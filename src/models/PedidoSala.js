var Sequelize = require('sequelize');
var sequelize = require('./database');
var Sala = require('./Sala')
var Pedido = require('./Pedido')

var PedidoSala = sequelize.define('pedidos_salas', {
}, 
{
    freezeTableName: true,
    timestamps: false,
});
Pedido.belongsToMany(Sala, { through: 'pedidos_salas',foreignKey:'idpedido'});
Sala.belongsToMany(Pedido, { through: 'pedidos_salas',foreignKey:'idsala'});
module.exports = PedidoSala