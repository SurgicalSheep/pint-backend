const jwt = require('jsonwebtoken')
const createError = require('http-errors');
const socketsConnected = new Array()
let io
//Sockets
function startSocket(server) {
          io = require('socket.io')(server,{
        cors: {
          origin: '*',
        }})
      
      //authenticate socket
      io.use(function(socket, next){
      if(socket.handshake.query && socket.handshake.query.env && socket.handshake.query.env == "tablet"){
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
        const timeoutRequest = setTimeout(() => {socket.emit("requestRefresh","requestRefresh")}, expiresIn)
      
        socket.on('disconnect', () => clearTimeout(timeoutRequest))
      
        return next()
      });
      //on connect
      io.on('connection', function(socket) {
        socketsConnected.push(socket)
      
        socket.emit("Connected","Connected")
      
        socket.on('disconnect',()=>{
          console.log("Disconnected");
          let i = socketsConnected.map((x)=>{
            return x.id
          }).indexOf(socket.id)
          socketsConnected.splice(i,1);
        })
      
        socket.on("error", (err) => {
            if (err && err.message === "unauthorized event") {
              socket.disconnect();
              let i = socketsConnected.map((x)=>{
                return x.id
              }).indexOf(socket.id)
              socketsConnected.splice(i,1);
            }
        })
      
        socket.on('nmrSockets',()=>{
          socket.emit('nmrSockets',socketsConnected.map((x)=>{
            return x.env + " " + x.idUser
          }))
      })
      });
return io;
}

function sendUpdateNotificacao(id,noti) {
    socketsConnected.map((x)=>{
        if(x.idUser == id){
           x.emit('updateNotificacao',{data:noti})
        }
      })
}

function sendUpdateReserva() {
    io.emit('updateReserva','updateReserva')
}

function sendUpdateUtilizador() {
    io.emit('updateUser','updateUser')
}

function sendUpdateSala() {
  io.emit('updateSala','updateSala')
}

function sendUpdatePedido() {
  io.emit('updateSala','updateSala')
}

function sendUpdateCentro() {
  io.emit('updateSala','updateSala')
}


module.exports= {
    startSocket:startSocket,
    socketsConnected:socketsConnected,
    sendUpdateNotificacao:sendUpdateNotificacao,
    sendUpdateUtilizador:sendUpdateUtilizador,
    sendUpdateReserva:sendUpdateReserva,
    sendUpdateSala:sendUpdateSala,
    sendUpdatePedido:sendUpdatePedido,
    sendUpdateCentro:sendUpdateCentro
}

