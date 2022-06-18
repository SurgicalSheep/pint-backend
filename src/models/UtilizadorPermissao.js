var Sequelize = require('sequelize');
var sequelize = require('./database');
const Utilizador = require('./utilizador')
const Permissao = require('./permissao')

var UtilizadorPermissao = sequelize.define('utilizadores_permissoes', {}, 
{
    freezeTableName: true,
    timestamps: false,
});

module.exports = UtilizadorPermissao