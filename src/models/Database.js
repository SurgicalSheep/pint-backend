var Sequelize = require('sequelize');
const sequelize = new Sequelize(
    'PINT',
    'postgres',
    '123123', {
        host: 'localhost',
        port: '5432',
        dialect: 'postgres'
    }
);
module.exports = sequelize;