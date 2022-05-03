/*var Sequelize = require('sequelize');
const sequelize = new Sequelize(
    'pint',
    'postgres',
    '123123', {
        host: 'localhost',
        port: '5432',
        dialect: 'postgres'
    }
);
module.exports = sequelize;*/
var Sequelize = require('sequelize');
const sequelize = new Sequelize('postgres://wmofcmru:itCC4s5yUEPDd_GdubIiP1P0_cf7DZ4I@tai.db.elephantsql.com/wmofcmru');
module.exports = sequelize;