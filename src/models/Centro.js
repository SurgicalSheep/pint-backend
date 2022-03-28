var Sequelize = require('sequelize');
var sequelize = require('./database');
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
    estado:Sequelize.BOOLEAN
}, {
    freezeTableName: true,
    timestamps: false,
});
Centro.hasMany(Sala,{foreignKey:'idcentro', onDelete: 'cascade'})
module.exports = Centro