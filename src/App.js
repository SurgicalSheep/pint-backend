const express = require('express');
const app = express();
require('dotenv').config()
require('./models/associations')
const centroRouters = require('./routes/centroRoute.js')
const utilizadorRouters = require('./routes/utilizadorRoute.js')
const salaRouters = require('./routes/salaRoute.js')
const equipamentoRouters = require('./routes/equipamentoRoute.js')
const empregadoLimpezaRouters = require('./routes/empregadoLimpezaRoute.js')
//const empregadoManutencaoRouters = require('./routes/empregadoManutencaoRoute')
const feedbackRouters = require('./routes/feedbackRoute.js')
const pedidoRouters = require('./routes/pedidoRoute')
const notificacaoRouters = require('./routes/notificacaoRoute')
const reservaRouters = require('./routes/reservaRoute')
//Configurações 
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

app.use('/', (req, res) => { 
    res.send(":)");
})
app.listen(app.get('port'), () => {
    console.log("Start server on port " + app.get('port'))
})