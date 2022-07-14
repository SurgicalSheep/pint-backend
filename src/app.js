const express = require('express');
var cors = require('cors')
const app = express();
const server = require('http').createServer(app)
require('dotenv').config()
require('./models/associations')
require('./models/redisDatabase');
const centroRouters = require('./routes/centroRoute.js')
const utilizadorRouters = require('./routes/utilizadorRoute.js')
const salaRouters = require('./routes/salaRoute.js')
const empregadoLimpezaRouters = require('./routes/empregadoLimpezaRoute.js')
const feedbackRouters = require('./routes/feedbackRoute.js')
const pedidoRouters = require('./routes/pedidoRoute')
const notificacaoRouters = require('./routes/notificacaoRoute')
const reservaRouters = require('./routes/reservaRoute');
const createError = require('http-errors');
const {startSocket} = require('./helpers/sockets')
const jwt = require('jsonwebtoken')
const checkMinutos = 1;

app.use(cors())
app.set('port', (process.env.PORT || 3000));
//Middlewares
app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.use('/centro', centroRouters)
app.use('/feedback', feedbackRouters)
app.use('/utilizador', utilizadorRouters)
app.use('/reserva',reservaRouters)
app.use('/sala', salaRouters)
app.use('/empregadoLimpeza',empregadoLimpezaRouters)
//app.use('/empregadoManutencao',empregadoManutencaoRouters)
app.use('/pedido',pedidoRouters)
app.use('/notificacao',notificacaoRouters);
app.get('/favicon.ico', (req, res) => res.sendStatus(204));

const Reservas = require('./models/reserva');
const sequelize = require('sequelize');
/*
setInterval(async() => {
    let now = new Date()
    let time = now.getHours() + ":"+ now.getMinutes()+":"+now.getSeconds();
    now = now.toISOString().split('T')[0]
    const reservas1Week = await Reservas.findAll({
      attributes: {
        include:[
          [
            sequelize.literal(
              `(CASE WHEN 'data'-7 < ${now} THEN '7D'  when ('data' = ${now} AND horainicio - ${time} < 0 )  THEN '5m' END)`
            ),
            "idk",
          ]
      ]
    },
    })
    console.log(reservas1Week);
}, checkMinutos * 60 * 1000);
*/
app.use(async (req,res,next) => {
    next(createError.NotFound("Route does not exist!"))
})

app.use((err,req,res,next) =>{
    console.log(err.message)
    const status = err.status || 500;
    res.status(status).send({data:err.message})
})

server.listen(app.get('port'), () => {
    console.log("Start server on port " + app.get('port'))
})

startSocket(server)