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
const {createNotificacaoReserva5Min} = require('./helpers/createNotificacao')
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

const sequelize = require('./models/database');
const { QueryTypes } = require('sequelize');
const reservasSent = new Array()
setInterval(async() => {
    let sendOne = false
    const reservas1Week = await sequelize.query(`SELECT "idreserva", "data", "horainicio", "horafinal", "observacoes", "idutilizador","idsala",
    CASE when ("data" = date(Now()) AND (horainicio - (CURRENT_TIME(0)::TIME + '01:00:00')) <= interval '5 minutes') AND (horainicio > (CURRENT_TIME(0)::TIME + '01:00:00')) THEN '5m'
    WHEN NOW()::DATE <= "data"::DATE AND "data" < NOW() + INTERVAL '7 DAYS' THEN '7D' 
    ELSE 'no'
     END AS "check" FROM "reservas" AS "reservas";`, { type: QueryTypes.SELECT,logging:false })
    reservas1Week.map(async(x)=>{
        let sent = false
            if(x.check == "5m"){
            reservasSent.map((y)=>{
                if(y.idreserva == x.idreserva && y.check5m){
                    sent = true
                }
            })
            if(!sent){
                let pos;
                reservasSent.map((y,i)=>{
                    if(y.idreserva == x.idreserva && y.check7D){
                        pos =  i
                    }
                })
                if(!pos){
                    await createNotificacaoReserva5Min(x)
                    reservasSent.push({idreserva:x.idreserva,check5m:true})
                }else if(!isNaN(pos)){
                //send
                console.log("ola")
                await createNotificacaoReserva5Min(x)
                console.log("adeus")
                reservasSent[pos].check5m = true;
                }
                
            }
        }
    })
    console.log(reservasSent);
}, checkMinutos * 20 * 1000);

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