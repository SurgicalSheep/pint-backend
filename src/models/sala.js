var Sequelize = require('sequelize');
var sequelize = require('./database');

var Sala = sequelize.define('salas', {
    idsala: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nome: {type:Sequelize.STRING,allowNull: true},
    lotacaomax: {type:Sequelize.INTEGER,allowNull: false},
    lotacao: {type:Sequelize.INTEGER,allowNull: true},
    descricao: {type:Sequelize.STRING,allowNull: true},
    estado: {type:Sequelize.BOOLEAN,allowNull: false,defaultValue:true},
    justificacaoestado:{type:Sequelize.STRING,allowNull:true}
}, {
    freezeTableName: true,
    timestamps: false,
    scopes: {
        noIdCentro: {
          attributes: { exclude: ["idcentro"] },
        },
    }
});

module.exports = Sala