var Sequelize = require('sequelize');
var sequelize = require('./database');

var Centro = sequelize.define('centros', {
    idcentro: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nome: Sequelize.STRING,
    cidade: {type:Sequelize.STRING,allowNull: false},
    endereco: {type:Sequelize.STRING,allowNull: false},
    imagem: {type:Sequelize.STRING},
    descricao: Sequelize.STRING,
    estado:{type:Sequelize.BOOLEAN,allowNull: true},
}, {
    freezeTableName: true,
    timestamps: false
});
module.exports = Centro