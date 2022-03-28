var Sequelize = require('sequelize');
var sequelize = require('./database');
const Equipamento = require('./Equipamento');

var Sala = sequelize.define('salas', {
    idsala: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    lotacaomax: {type:Sequelize.INTEGER,allowNull: false},
    lotacao: Sequelize.INTEGER,
    descricao: Sequelize.STRING
}, {
    freezeTableName: true,
    timestamps: false,
});
Sala.hasMany(Equipamento,{foreignKey:'idsala',onDelete: 'cascade'})
module.exports = Sala