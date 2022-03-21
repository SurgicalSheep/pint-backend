const express = require('express');
const app = express();
const utilizadorRouters = require('./routes/utilizadorRoute.js')

//Configurações
app.set('port', process.env.PORT || 3000);
//Middlewares
app.use(express.json());
app.use('/utilizador', utilizadorRouters)
app.use('/', (req, res) => {
    res.send(":)");
})
app.listen(app.get('port'), () => {
    console.log("Start server on port " + app.get('port'))
})