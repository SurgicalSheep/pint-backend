var Sequelize = require('sequelize');
var sequelize = require('./database');
const Utilizador = require('./Utilizador')
const Permissao = require('./Permissao')

var UtilizadorPermissao = sequelize.define('utilizadores_permissoes', {}, 
{
    freezeTableName: true,
    timestamps: false,
});

Utilizador.belongsToMany(Permissao, { through: UtilizadorPermissao });
Permissao.belongsToMany(Utilizador, { through: UtilizadorPermissao });

module.exports = UtilizadorPermissao