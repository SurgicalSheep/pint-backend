var Sequelize = require('sequelize');
var sequelize = require('./database');
const Utilizador = require('./utilizador');

var EmpregadoManutencao = sequelize.define('empregados_manutencoes', {
    idutilizador: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nome: {type:Sequelize.STRING,allowNull: false},
      datanascimento: {type:Sequelize.DATE,allowNull: false},
      telemovel: {type:Sequelize.STRING,allowNull: false},
      email: {type:Sequelize.STRING,allowNull: false},
      password: {type:Sequelize.STRING,allowNull: false},
      estado:{type:Sequelize.BOOLEAN,allowNull:false,defaultValue:false},
      firstlogin:{type:Sequelize.BOOLEAN,allowNull:false,defaultValue:true},
      verificado:{type:Sequelize.BOOLEAN,allowNull:false,defaultValue:false},
      token:{type:Sequelize.STRING,allowNull:true},
      foto:{type:Sequelize.BLOB,allowNull:true},
    disponibilidade: {type:Sequelize.BOOLEAN,allowNull: false},
    especialidade: {type:Sequelize.TEXT,allowNull: false}
}, {
    freezeTableName: true,
    timestamps: false,
    scopes: {
        noPassword: {
          attributes: { exclude: ["password"] },
        },
        noIdCentro: {
            attributes: { exclude: ["idcentro"] },
          },
      }
});
(queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((transaction) => {
      return queryInterface.createTable('empregados_limpeza', {
        disponibilidade: {type:Sequelize.BOOLEAN,allowNull: false}
      }, {
        transaction
      }).then(() => queryInterface.sequelize.query('ALTER TABLE "empregados_manutencoes" INHERITs "utilizadores"'));
    });
  }
EmpregadoManutencao.belongsTo(Utilizador,{foreignKey:'idutilizador'})
module.exports = EmpregadoManutencao