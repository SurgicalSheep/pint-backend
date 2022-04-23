var Sequelize = require('sequelize');
var sequelize = require('./database');
const Equipamento = require('./Equipamento');

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
    estado: {type:Sequelize.BOOLEAN,allowNull: false,defaultValue:true}
}, {
    freezeTableName: true,
    timestamps: false,
});

Sala.hasMany(Equipamento,{foreignKey:'idsala',onDelete: 'cascade'})
Equipamento.belongsTo(Sala,{foreignKey:'idsala'})
module.exports = Sala