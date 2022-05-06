var db = require('./Database')
var centro = require('./Centro')
var empregadoLimpeza = require('./EmpregadoLimpeza')
var equipamento = require('./equipamento')
var feedback = require('./Feedback')
var notificacao = require('./Notificacao')
var pedido = require('./Pedido')
var permissao = require('./Permissao')
var reserva = require('./Reserva')
var reservaEquipamento = require('./ReservaEquipamento')
var sala = require('./Sala')
var utilizador = require('./Utilizador')
var utilizadorNotificacoes = require('./UtilizadoresNotificacao')
var utilizadorPermissao = require('./UtilizadorPermissao')

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
feedback.belongsTo(reserva,{foreignKey:'idreserva',allowNull:true});

notificacao.belongsTo(utilizador,{foreignKey:'idutilizador',as:'utilizador', useJunctionTable: false});

pedido.belongsTo(utilizador,{foreignKey:'idutilizador',allowNull:false});
pedido.belongsTo(sala,{foreignKey:'idsala',allowNull:false});

reserva.belongsTo(sala,{foreignKey:'idsala'});
reserva.belongsTo(utilizador,{foreignKey:'idutilizador'});

reserva.belongsToMany(equipamento, { through: reservaEquipamento });
equipamento.belongsToMany(reserva, { through: reservaEquipamento });

sala.hasMany(equipamento,{foreignKey:'idsala',onDelete: 'cascade'});
equipamento.belongsTo(sala,{foreignKey:'idsala'});

notificacao.belongsToMany(utilizador,{through:utilizadorNotificacoes,foreignKey:'idnotificacao',onDelete: 'CASCADE'});
utilizador.belongsToMany(notificacao,{through:utilizadorNotificacoes,foreignKey:'idutilizador',onDelete: 'CASCADE'});

utilizador.belongsToMany(permissao, { through: utilizadorPermissao });
permissao.belongsToMany(utilizador, { through: utilizadorPermissao });

db.sync();