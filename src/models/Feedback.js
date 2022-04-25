var Sequelize = require('sequelize');
var sequelize = require('./database');
var Utilizador = require('./Utilizador')
var Sala = require('./Sala')
var Reserva = require('./Reserva')

var Feedback = sequelize.define('feedbacks', {
    idfeedback: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    classificacao: {type:Sequelize.INTEGER,allowNull: false},
    comentario: {type:Sequelize.STRING,allowNull: false},
    criado_em: {type:Sequelize.DATE,allowNull: false}
}, {
    freezeTableName: true,
    timestamps: false,
});

Feedback.belongsTo(Utilizador,{foreignKey:'idutilizador',allowNull:false})
Feedback.belongsTo(Sala,{foreignKey:'idsala',allowNull:true})
Feedback.belongsTo(Reserva,{foreignKey:'idreserva',allowNull:true})
module.exports = Feedback