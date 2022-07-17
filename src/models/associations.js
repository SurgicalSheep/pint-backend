var db = require('./database')
var centro = require('./centro')
var empregadoLimpeza = require('./empregadoLimpeza')
var feedback = require('./feedback')
var notificacao = require('./notificacao')
var pedido = require('./pedido')
var reserva = require('./reserva')
var sala = require('./sala')
var utilizador = require('./utilizador')
var utilizadorNotificacoes = require('./utilizadoresNotificacao')

centro.hasMany(sala,{foreignKey:'idcentro', onDelete: 'cascade'});
centro.hasMany(utilizador,{foreignKey:'idcentro'});
centro.hasMany(empregadoLimpeza,{foreignKey:'idcentro'});

utilizador.belongsTo(centro,{foreignKey:'idcentro'});
utilizador.hasMany(notificacao,{foreignKey:'idutilizador',as:'utilizador',useJunctionTable: false});
utilizador.hasMany(reserva,{foreignKey:'idutilizador'});

empregadoLimpeza.belongsTo(centro,{foreignKey:'idcentro'});
empregadoLimpeza.belongsTo(utilizador,{foreignKey:'idutilizador'});

feedback.belongsTo(utilizador,{foreignKey:'idutilizador',allowNull:false,as:'utilizadores'});
feedback.belongsTo(sala,{foreignKey:'idsala',allowNull:true});
reserva.hasMany(feedback,{foreignKey:'idreserva',allowNull:true, onDelete: 'cascade', hooks:true})
feedback.belongsTo(reserva,{foreignKey:'idreserva',allowNull:true, onDelete: 'cascade', hooks:true});

notificacao.belongsTo(utilizador,{foreignKey:'idutilizador',as:'utilizador', useJunctionTable: false});

pedido.belongsTo(utilizador,{foreignKey:'idutilizador',allowNull:false});
pedido.belongsTo(sala,{foreignKey:'idsala',allowNull:false});

reserva.belongsTo(sala,{foreignKey:'idsala'});
reserva.belongsTo(utilizador,{foreignKey:'idutilizador'});

sala.hasMany(reserva,{foreignKey:'idsala',onDelete: 'CASCADE'});
sala.belongsTo(centro,{foreignKey:'idcentro', onDelete: 'cascade'})

notificacao.belongsToMany(utilizador,{through:utilizadorNotificacoes,foreignKey:'idnotificacao',onDelete: 'CASCADE'});
utilizador.belongsToMany(notificacao,{through:utilizadorNotificacoes,foreignKey:'idutilizador',onDelete: 'CASCADE'});

db.sync({logging:false})