var Sequelize = require('sequelize');
var sequelize = require('./database');

var Equipamento = sequelize.define('equipamentos', {
    idequipamento: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    tipo: {type:Sequelize.STRING,allowNull: false},
    estado: Sequelize.STRING,
    especificacoes:Sequelize.STRING
}, {
    freezeTableName: true,
    timestamps: false,
});

module.exports = Equipamento