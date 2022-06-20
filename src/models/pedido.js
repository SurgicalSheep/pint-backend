var Sequelize = require('sequelize');
var sequelize = require('./database');
var Utilizador = require('./utilizador')
var Sala = require('./sala')


var Pedido = sequelize.define('pedidos', {
    idpedido: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    duracaomax:Sequelize.TIME,
    descricao:Sequelize.TEXT
}, 
{
    freezeTableName: true,
    timestamps: false,
});

module.exports = Pedido