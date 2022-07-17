var Sequelize = require('sequelize');
var sequelize = require('./database');


var Pedido = sequelize.define('pedidos', {
    idpedido: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    duracaomax:Sequelize.TIME,
    descricao:Sequelize.TEXT,
    estado:{type:Sequelize.BOOLEAN,defaultValue:false,allowNull:true},
    data:{type:Sequelize.BOOLEAN,allowNull:true},
}, 
{
    freezeTableName: true,
    timestamps: false,
});

module.exports = Pedido