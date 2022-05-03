var Sequelize = require('sequelize');
var sequelize = require('./database');
const Utilizador = require('./Utilizador')
const Permissao = require('./Permissao')

var UtilizadorPermissao = sequelize.define('utilizadores_permissoes', {}, 
{
    freezeTableName: true,
    timestamps: false,
});

module.exports = UtilizadorPermissao