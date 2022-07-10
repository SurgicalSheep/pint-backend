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
);*/

var Sequelize = require("sequelize");
const sequelize = new Sequelize(process.env.DATABASECONNECTIONSTRING,{dialect:"postgres",pool: {
  max: 2,
  min: 0,
  acquire: 30000,
  idle: 10000
}});
sequelize.authenticate();
process.on('SIGINT', async() => {
  console.log('Closing with cntrl c');
  await sequelize.close();
});

module.exports = sequelize;
