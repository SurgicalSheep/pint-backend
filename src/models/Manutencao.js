var Sequelize = require('sequelize');
var sequelize = require('./database');
const EmpregadoManutencao = require('./EmpregadoManutencao');
const Sala = require('./sala');

var Manutencao = sequelize.define('manutencoes', {
    idmanutencao: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    tipoproblema: {type:Sequelize.TEXT,allowNull: false},
    descricao: {type:Sequelize.TEXT,allowNull: false}
}, {
    freezeTableName: true,
    timestamps: false,
});
EmpregadoManutencao.hasMany(Manutencao,{foreignKey:'idempregadomanutencao'})
Sala.hasMany(Manutencao,{foreignKey:'idsala'})
module.exports = Manutencao