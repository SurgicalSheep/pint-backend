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
    nome: Sequelize.STRING,
    datanascimento: Sequelize.DATE,
    telemovel: Sequelize.STRING,
    email: Sequelize.STRING,
    password: Sequelize.STRING,
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
