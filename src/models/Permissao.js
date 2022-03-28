var Sequelize = require('sequelize');
var sequelize = require('./database');

var Permissao = sequelize.define('permissoes', {
    idpermissao: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    permissao: {type:Sequelize.TEXT,allowNull: false}
}, {
    freezeTableName: true,
    timestamps: false,
});
module.exports = Permissao