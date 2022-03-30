const express = require('express');
const app = express();
const utilizadorRouters = require('./routes/utilizadorRoute.js')
const centroRouters = require('./routes/centroRoute.js')
const salaRouters = require('./routes/salaRoute.js')
//Configurações
app.set('port', process.env.PORT || 3000);
//Middlewares
app.use(express.json());
app.use('/utilizador', utilizadorRouters)
app.use('/centro', centroRouters)
app.use('/sala', salaRouters)
app.use('/', (req, res) => {
    res.send(":)");
})
app.listen(app.get('port'), () => {
    console.log("Start server on port " + app.get('port'))
})