var Sequelize = require("sequelize");
var sequelize = require("./database");

var Utilizador = sequelize.define(
  "utilizadores",
  {
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
    foto:{type:Sequelize.BLOB,allowNull:true}
  },
  {
    freezeTableName: true,
    timestamps: false,
    scopes: {
      noPassword: {
        attributes: { exclude: ["password"] },
      },
    },
  }
);
module.exports = Utilizador;
