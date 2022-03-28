var Sequelize = require('sequelize');
var sequelize = require('./database');
const Utilizador = require('./Utilizador');

var EmpregadoManutencao = sequelize.define('empregados_manutencao', {
    idempregadomanutencao: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    disponibilidade: {type:Sequelize.BOOLEAN,allowNull: false},
    especialidade: {type:Sequelize.TEXT,allowNull: false}
}, {
    freezeTableName: true,
    timestamps: false,
});
EmpregadoManutencao.belongsTo(Utilizador,{foreignKey:'idutilizador'})
module.exports = EmpregadoManutencao