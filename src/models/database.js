/*var Sequelize = require("sequelize");
const sequelize = new Sequelize(
  process.env.DATABASENAME,
  "postgres",
  process.env.DATABASEPWD,
  {
    host: "localhost",
    port: "5432",
    dialect: "postgres",
  }
);
*/
var Sequelize = require("sequelize");
const sequelize = new Sequelize(process.env.DATABASECONNECTIONSTRING,{dialect:"postgres"});
sequelize.authenticate();
module.exports = sequelize;
