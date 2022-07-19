const Notificacao = require("../models/notificacao");
const Sala = require("../models/sala");
const Utilizador = require("../models/utilizador")
const Reserva = require("../models/reserva")
const { sendUpdateNotificacao } = require("../helpers/sockets");
const sequelize = require("../models/database");
const { Op } = require("sequelize");

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

async function createNotificacaoSalaIndisponivel(salaIndisponivel) {
    const t = await sequelize.transaction();
    try {
      const sala = await Sala.findByPk(salaIndisponivel.idsala,{transaction:t});
      let now = new Date()
      let time = now.getHours() + ":"+ now.getMinutes()+":"+now.getSeconds();
      const reservasAfetadas = await Reserva.findAll({
        where:{[Op.and]:[{
            idsala:sala.idsala
      },{
            data:{[Op.gte]:now}
      },{
            horainicio:{[Op.gte]:time}
      }]}},{transaction:t});
      if(!salaIndisponivel.justificacao){
        salaIndisponivel.justificacao = "motivos desconhecidos!"
      }
      const notificacao = await Notificacao.create({
        titulo: "Sala indisponível!",
        descricao: `A sala ${sala.nome} acabou de ficar indisponível devido a ${salaIndisponivel.justificacao}`,
      },{transaction:t});
      await t.commit();
      let usersSent = []
      let sent = false;
      reservasAfetadas.map(async(reservaAfetada)=>{
        usersSent.map(async(x)=>{
          if(!(x == reservaAfetada.idutilizador)){
            await notificacao.addUtilizadores(reservaAfetada.idutilizador);
            usersSent.push(reservaAfetada.idutilizador)
          }
        })
        sendUpdateNotificacao(reservaAfetada.idutilizador, notificacao);
      });
    } catch (error) {
      await t.rollback()
      console.log(error);
    }
  }

module.exports = {
  createNotificacaoReserva5Min: createNotificacaoReserva5Min,
  createNotificacaoSalaIndisponivel:createNotificacaoSalaIndisponivel
};
