const express = require('express');
const app = express();
const centroRouters = require('./routes/centroRoute.js')
const utilizadorRouters = require('./routes/utilizadorRoute.js')
const salaRouters = require('./routes/salaRoute.js')
const equipamentoController = require('./routes/equipamentoRoute.js')
const empregadoLimpezaController = require('./routes/empregadoLimpezaRoute.js')
//const empregadoManutencaoController = require('./routes/empregadoManutencaoRoute')
const feedbackController = require('./routes/feedbackRoute.js')
const pedidoController = require('./routes/pedidoRoute')
//Configurações
app.set('port', process.env.PORT || 3000);
//Middlewares
app.use(express.json());
app.use('/centro', centroRouters)
app.use('/feedback', feedbackController)
app.use('/utilizador', utilizadorRouters)
app.use('/sala', salaRouters)
app.use('/equipamento',equipamentoController)
app.use('/empregadoLimpeza',empregadoLimpezaController)
//app.use('/empregadoManutencao',empregadoManutencaoController)
app.use('/pedido',pedidoController)
app.use('/', (req, res) => {
    res.send(":)");
})

app.listen(app.get('port'), () => {
    console.log("Start server on port " + app.get('port'))
})