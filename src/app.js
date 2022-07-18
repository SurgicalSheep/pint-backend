const express = require("express");
var cors = require("cors");
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const server = require("http").createServer(app);
require("dotenv").config();
require("./models/associations");
const client = require("./models/redisDatabase");
const centroRouters = require("./routes/centroRoute.js");
const utilizadorRouters = require("./routes/utilizadorRoute.js");
const salaRouters = require("./routes/salaRoute.js");
const empregadoLimpezaRouters = require("./routes/empregadoLimpezaRoute.js");
const feedbackRouters = require("./routes/feedbackRoute.js");
const pedidoRouters = require("./routes/pedidoRoute");
const notificacaoRouters = require("./routes/notificacaoRoute");
const reservaRouters = require("./routes/reservaRoute");
const createError = require("http-errors");
const { startSocket } = require("./helpers/sockets");
const { createNotificacaoReserva5Min } = require("./helpers/createNotificacao");
const {createPedidoLimpezaAutomatico} = require("./helpers/createPedido")
const checkMinutos = 1;

app.use(cors());
app.set("port", process.env.PORT || 3000);
//Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/centro", centroRouters);
app.use("/feedback", feedbackRouters);
app.use("/utilizador", utilizadorRouters);
app.use("/reserva", reservaRouters);
app.use("/sala", salaRouters);
app.use("/empregadoLimpeza", empregadoLimpezaRouters);
//app.use('/empregadoManutencao',empregadoManutencaoRouters)
app.use("/pedido", pedidoRouters);
app.use("/notificacao", notificacaoRouters);
var options = {
  customCss: '.swagger-ui .topbar { display: none }'
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));
app.get("/favicon.ico", (req, res) => res.sendStatus(204));

const sequelize = require("./models/database");
const { QueryTypes } = require("sequelize");
setInterval(async () => {
    const reservasSentRedis = await client.get('reservasSent');
    const limpezasSentRedis = await client.get('limpezasSent');
    let reservasSent = JSON.parse(reservasSentRedis)
    let limpezasSent = JSON.parse(limpezasSentRedis)
    if(!reservasSent){
        reservasSent = new Array(0)
    }
    if(!limpezasSent){
        limpezasSent = new Array(0)
    }

  const reservasCheck = await sequelize.query(
    `SELECT
    *
FROM
    (
        SELECT
            "idreserva",
            "data",
            "horainicio",
            "horafinal",
            "observacoes",
            "idutilizador",
            "idsala",
            CASE
                WHEN (
                    (
                        horainicio - (CURRENT_TIME(0) :: TIME + '01:00:00')
                    ) <= INTERVAL '5 minutes'
                )
                AND (
                    horainicio > (CURRENT_TIME(0) :: TIME + '01:00:00')
                ) THEN '5m'
                WHEN (horafinal - (CURRENT_TIME(0) :: TIME + '01:00:00')) <= INTERVAL '0 minutes' AND (horafinal - (CURRENT_TIME(0) :: TIME + '01:00:00') >= '-00:05:00'::INTERVAL)  THEN 'L'
            END AS "check"
        FROM
            "reservas"
    ) tmp
WHERE
    "data" = date(NOW())
    AND tmp.check is not null;
    `,
    { type: QueryTypes.SELECT, logging: false }
  );

    reservasCheck.map((x) => {
        let sent = false;
        if (x.check == "5m") {
          reservasSent.map((y) => {
            if (y.idreserva == x.idreserva) {
              sent = true;
            }
          });
          if (!sent) {
            createNotificacaoReserva5Min(x);
            reservasSent.push({ idreserva: x.idreserva});
          }
        }else if(x.check == "L"){
            
            limpezasSent.map((y) => {
                if (y.idreserva == x.idreserva) {
                  sent = true;
                }
              });
              if (!sent) {
                createPedidoLimpezaAutomatico(x);
                limpezasSent.push({ idreserva: x.idreserva});
              }
        }
      });
  
  const reservasSentUpdate = JSON.stringify(reservasSent);
  const limpezasSentUpdate = JSON.stringify(limpezasSent);
    await client.set('reservasSent', reservasSentUpdate)
    await client.set('limpezasSent', limpezasSentUpdate)
}, checkMinutos * 60 * 1000);

app.use(async (req, res, next) => {
  next(createError.NotFound("Route does not exist!"));
});

app.use((err, req, res, next) => {
  console.log(err.message);
  const status = err.status || 500;
  res.status(status).send({ data: err.message });
});

server.listen(app.get("port"), () => {
  console.log("Start server on port " + app.get("port"));
});

startSocket(server);
