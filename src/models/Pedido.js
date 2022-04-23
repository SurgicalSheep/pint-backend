var Sequelize = require('sequelize');
var sequelize = require('./database');
var Utilizador = require('./Utilizador')
var Sala = require('./Sala')


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
Pedido.belongsTo(Utilizador,{foreignKey:'idutilizador',allowNull:false})
Pedido.belongsTo(Sala,{foreignKey:'idsala',allowNull:false})
module.exports = Pedido