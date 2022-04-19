var Sequelize = require('sequelize');
var sequelize = require('./database');
var Utilizador = require('./Utilizador')
var empregadoLimpeza = require('./EmpregadoLimpeza')
const Sala = require('./Sala');

var Centro = sequelize.define('centros', {
    idcentro: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nome: Sequelize.STRING,
    cidade: {type:Sequelize.STRING,allowNull: false},
    endereco: {type:Sequelize.STRING,allowNull: false},
    imagem: {type:Sequelize.STRING,allowNull: false},
    descricao: Sequelize.STRING,
    estado:{type:Sequelize.BOOLEAN,allowNull: false},
}, {
    freezeTableName: true,
    timestamps: false,
});
Centro.hasMany(Sala,{foreignKey:'idcentro', onDelete: 'cascade'});
Centro.hasMany(Utilizador,{foreignKey:'idcentro'});
Centro.hasMany(empregadoLimpeza,{foreignKey:'idcentro'});
Utilizador.belongsTo(Centro,{foreignKey:'idcentro'})
empregadoLimpeza.belongsTo(Centro,{foreignKey:'idcentro'})
module.exports = Centro