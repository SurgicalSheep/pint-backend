const Notificacao = require("../models/notificacao");
const Sala = require("../models/sala");
const Utilizador = require("../models/utilizador")
const { sendUpdateNotificacao } = require("../helpers/sockets");
const sequelize = require("../models/database");

async function createNotificacaoReserva5Min(reserva) {
  const t = await sequelize.transaction();
  try {
    const sala = await Sala.findByPk(reserva.idsala,{transaction:t});
    const user = await Utilizador.findByPk(reserva.idutilizador,{transaction:t});
    const notificacao = await Notificacao.create({
      titulo: "Reserva prestes a começar",
      descricao: `Faltam menos de 5 minutos para a sua reserva da sala ${sala.nome} começar!`,
    },{transaction:t});

    await notificacao.addUtilizadores(user, { transaction: t });
    await t.commit()
    sendUpdateNotificacao(user.idutilizador, notificacao);
  } catch (error) {
    await t.rollback()
    console.log(error);
  }
}

async function createNotificacaoSalaIndisponivel(sala) {
    const t = await sequelize.transaction();
    try {
      const sala = await Sala.findByPk(sala.idsala,{transaction:t});
      const user = await Utilizador.findByPk(reserva.idutilizador,{transaction:t});
      const notificacao = await Notificacao.create({
        titulo: "Reserva prestes a começar",
        descricao: `Faltam menos de 5 minutos para a sua reserva da sala ${sala.nome} começar!`,
      },{transaction:t});
  
      await notificacao.addUtilizadores(user, { transaction: t });
      await t.commit()
      sendUpdateNotificacao(user.idutilizador, notificacao);
    } catch (error) {
      await t.rollback()
      console.log(error);
    }
  }

module.exports = {
  createNotificacaoReserva5Min: createNotificacaoReserva5Min
};
