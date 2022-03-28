var Sequelize = require('sequelize');
var sequelize = require('./database');
const Utilizador = require('./Utilizador');

var EmpregadoLimpeza = sequelize.define('empregados_limpeza', {
    idempregadolimpeza: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    disponibilidade: {type:Sequelize.BOOLEAN,allowNull: false}
}, {
    freezeTableName: true,
    timestamps: false,
});
EmpregadoLimpeza.belongsTo(Utilizador,{foreignKey:'idutilizador'})
module.exports = EmpregadoLimpeza