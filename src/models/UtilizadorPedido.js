var Sequelize = require('sequelize');
var sequelize = require('./database');
const Utilizador = require('./Utilizador')
const Pedido = require('./Permissao')

var UtilizadorPedido = sequelize.define('utilizadores_pedidos', {}, 
{
    freezeTableName: true,
    timestamps: false,
});

Utilizador.belongsToMany(Pedido, { through: UtilizadorPedido });
Pedido.belongsToMany(Utilizador, { through: UtilizadorPedido });

module.exports = UtilizadorPedido