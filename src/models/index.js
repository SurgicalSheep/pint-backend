require('./models/associations')

const db = {}
db.centro = require('./Centro')
db.empregadoLimpeza = require('./EmpregadoLimpeza')
db.equipamento = require('./Equipamento')
db.feedback = require('./Feedback')
db.notificacao = require('./Notificacao')
db.pedido = require('./Pedido')
db.permissao = require('./Permissao')
db.reserva = require('./Reserva')
db.reservaEquipamento = require('./ReservaEquipamento')
db.sala = require('./Sala')
db.utilizador = require('./Utilizador')
db.utilizadorNotificacoes = require('./UtilizadoresNotificacao')
db.utilizadorPermissao = require('./UtilizadorPermissao')
db.database = require('./Database')

module.exports = db;