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
const jwt = require('jsonwebtoken')
const checkMinutos = 1;
//Sockets
const io = require('socket.io')(server,{
    cors: {
      origin: '*',
    }})
let socketsConnected = new Array()
//authenticate socket
io.use(function(socket, next){
  if(socket.handshake.query && socket.handshake.query.env && socket.handshake.query.env === "tablet"){
    socket.env = socket.handshake.query.env
    next();
  }else{
    if (socket.handshake.query && socket.handshake.query.token && socket.handshake.query.env && (socket.handshake.query.env === "web" || socket.handshake.query.env === "mobile")){
      jwt.verify(socket.handshake.query.token, process.env.TOKEN_KEY, function(err, payload) {
        if (err){
          return next(createError.Unauthorized("Authentication error"));
        } 
        if (socketsConnected.some(e => e.idUser === payload.sub && e.env === socket.handshake.query.env)){
          return next(createError.Conflict("Already Connected"));
        } 
        socket.idUser = payload.sub;
        socket.decodedToken = payload;
        socket.env = socket.handshake.query.env;
        next();
      });
    }
    else {
        next(createError.Unauthorized("Something missing"));
    }    
  }
    
  })
  //disconnect socket on jwt expire
  io.use((socket, next) => {
    if(socket.env == "tablet"){
      return next();
    }
    const decodedToken = socket.decodedToken

    if (!decodedToken.exp) {
      return next(createError.Unauthorized());
    }
    const expiresIn = (decodedToken.exp - Date.now() / 1000) * 1000
    const timeout = setTimeout(() => {socket.disconnect(true)}, expiresIn)
  
    socket.on('disconnect', () => clearTimeout(timeout))
  
    return next()
  });
  //send request refresh
  io.use((socket, next) => {
    if(socket.env == "tablet"){
      return next();
    }
    const decodedToken = socket.decodedToken

    if (!decodedToken.exp) {
      return next(createError.Unauthorized());
    }
    const expiresIn = ((decodedToken.exp - Date.now() / 1000) * 1000)-120000
    const timeout = setTimeout(() => {socket.emit("requestRefresh","requestRefresh")}, expiresIn)
  
    socket.on('disconnect', () => clearTimeout(timeout))
  
    return next()
  });
  //on connect
  io.on('connection', function(socket) {
    socketsConnected.push(socket)

    socket.emit("Connected","Connected")

    socket.on('disconnect',()=>{
        socketsConnected = socketsConnected.filter(obj => obj.id != socket.id);
    })

    socket.on('setOffline',()=>{
      console.log("Disconnected")
      socket.disconnect();
    })

    socket.on("error", (err) => {
        if (err && err.message === "unauthorized event") {
          socket.disconnect();
          socketsConnected = socketsConnected.filter(obj => obj.id != socket.id);
        }
    })

    socket.on('test',()=>{
        socket.emit('newUser',"Nada")
    })

    socket.on('aaa',()=>{
      io.emit("ping","Ola")
    })

    socket.on('nmrSockets',()=>{
      socket.emit('nmrSockets',socketsConnected.map((x)=>{
        return x.env
      }))
  })
  });
app.set('socketio', io);
app.set('socketsConnected',socketsConnected)

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
/*
const Reservas = require('./models/reserva')

setInterval(async() => {
    let now = new Date()
    let time = now.getHours() + ":"+ now.getMinutes()+":"+now.getSeconds();
    const reservas1Week = await Reservas.findAll({
      attributes: [
        `(CASE WHEN 'data'+7 < 0 THEN '7D'  when ('data' = ${now} AND horainicio - ${time} < 0 )  THEN '5m' END)`
      ],
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