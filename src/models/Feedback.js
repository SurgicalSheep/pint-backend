var Sequelize = require('sequelize');
var sequelize = require('./database');
var Utilizador = require('./Utilizador')
var Sala = require('./Sala')
var Centro = require('./Centro')

var Feedback = sequelize.define('feedbacks', {
    idfeedback: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    comentario: {type:Sequelize.STRING,allowNull: false},
    criado_em: {type:Sequelize.DATE,allowNull: false}
}, {
    freezeTableName: true,
    timestamps: false,
});

Feedback.belongsTo(Utilizador,{foreignKey:'idutilizador',allowNull:false})
Feedback.belongsTo(Sala,{foreignKey:'idsala',allowNull:true})
Feedback.belongsTo(Centro,{foreignKey:'idcentro',allowNull:true})
module.exports = Feedback