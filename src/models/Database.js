var Sequelize = require('sequelize');
const sequelize = new Sequelize(
    'pint',
    'postgres',
    '123123', {
        host: 'localhost',
        port: '5432',
        dialect: 'postgres'
    }
);
module.exports = sequelize;