const express = require('express');
var cors = require('cors')
const app = express();
require('dotenv').config()
require('./models/associations')
require('./models/redisDatabase');
const centroRouters = require('./routes/centroRoute.js')
const utilizadorRouters = require('./routes/utilizadorRoute.js')
const salaRouters = require('./routes/salaRoute.js')
const equipamentoRouters = require('./routes/equipamentoRoute.js')
const empregadoLimpezaRouters = require('./routes/empregadoLimpezaRoute.js')
//const empregadoManutencaoRouters = require('./routes/empregadoManutencaoRoute')
const feedbackRouters = require('./routes/feedbackRoute.js')
const pedidoRouters = require('./routes/pedidoRoute')
const notificacaoRouters = require('./routes/notificacaoRoute')
const reservaRouters = require('./routes/reservaRoute');
const createError = require('http-errors');
//Configurações 
app.use(cors())
app.set('port', process.env.PORT || 3000);
//Middlewares
app.use(express.json());
app.use('/centro', centroRouters)
app.use('/feedback', feedbackRouters)
app.use('/utilizador', utilizadorRouters)
app.use('/reserva',reservaRouters)
app.use('/sala', salaRouters)
app.use('/equipamento',equipamentoRouters)
app.use('/empregadoLimpeza',empregadoLimpezaRouters)
//app.use('/empregadoManutencao',empregadoManutencaoRouters)
app.use('/pedido',pedidoRouters)
app.use('/notificacao',notificacaoRouters)

app.use(async (req,res,next) => {
    next(createError.NotFound("Route does not exist!"))
})

app.use((err,req,res,next) =>{
    const status = err.status || 500;
    res.status(status).send({data:err.message})
})

app.listen(app.get('port'), () => {
    console.log("Start server on port " + app.get('port'))
})