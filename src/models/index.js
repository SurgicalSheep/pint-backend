require('./models/associations')

const db = {}
db.centro = require('./Centro')
db.empregadoLimpeza = require('./EmpregadoLimpeza')
db.equipamento = require('./Equipamento')
db.feedback = require('./Feedback')
db.notificacao = require('./notificacao')
db.pedido = require('./pedido')
db.permissao = require('./permissao')
db.reserva = require('./reserva')
db.reservaEquipamento = require('./reservaEquipamento')
db.sala = require('./sala1')
db.utilizador = require('./utilizador1')
db.utilizadorNotificacoes = require('./utilizadoresNotificacao')
db.utilizadorPermissao = require('./utilizadorPermissao')
db.database = require('./Database')

module.exports = db;