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
    ncolaborador: {type:Sequelize.STRING,allowNull: false, unique: true},
    admin:{type:Sequelize.BOOLEAN,allowNull: false, defaultValue:false},
    nome: {type:Sequelize.STRING,allowNull: false},
    telemovel: {type:Sequelize.STRING,allowNull: false},
    email: {type:Sequelize.STRING,allowNull: false, unique: true},
    password: {type:Sequelize.STRING,allowNull: false},
    estado:{type:Sequelize.BOOLEAN,allowNull:false,defaultValue:false},
    firstlogin:{type:Sequelize.BOOLEAN,allowNull:false,defaultValue:true},
    verificado:{type:Sequelize.BOOLEAN,allowNull:false,defaultValue:false},
    token:{type:Sequelize.STRING,allowNull:true},
    foto:{type:Sequelize.STRING,allowNull:true}
  },
  {
    freezeTableName: true,
    timestamps: false,
    scopes: {
      noPassword: {
        attributes: { exclude: ["password"] },
      },
      noIdCentro: {
        attributes: { exclude: ["idcentro"] },
      },
    },
  }
);
module.exports = Utilizador;
