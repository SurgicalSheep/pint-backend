const { Op } = require("sequelize");
const sequelize = require("../models/database");
const Pedido = require("../models/pedido")
const Utilizador = require("../models/utilizador")
const EmpregadoLimpeza = require("../models/empregadoLimpeza")
const Sala = require("../models/sala")
const {sendUpdatePedido} = require('./sockets')

async function createPedidoLimpezaAutomatico(reserva) {
    const newPedido = await Pedido.create({
        duracaomax:"00:15:00",
        idsala:reserva.idsala,
        descricao:"Limpeza e desinfeção"
    })
    sendUpdatePedido()
}

module.exports = {
    createPedidoLimpezaAutomatico:createPedidoLimpezaAutomatico
}