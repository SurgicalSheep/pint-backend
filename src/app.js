const express = require("express");
var cors = require("cors");
const app = express();
const server = require("http").createServer(app);
require("dotenv").config();
require("./models/associations");
require("./models/redisDatabase");
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
app.get("/favicon.ico", (req, res) => res.sendStatus(204));

const sequelize = require("./models/database");
const { QueryTypes } = require("sequelize");
const reservasSent = new Array();
const limpezasSent = new Array();
setInterval(async () => {
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
                WHEN (horafinal - (CURRENT_TIME(0) :: TIME + '01:00:00')) <= INTERVAL '0 minutes' THEN 'L'
            END AS "check"
        FROM
            "reservas"
    ) tmp
WHERE
    "data" = date(NOW())
    AND tmp.check is not null;`,
    { type: QueryTypes.SELECT, logging: false }
  );
  reservasCheck.map(async (x) => {
    let sent = false;
    if (x.check == "5m") {
      reservasSent.map((y) => {
        if (y.idreserva == x.idreserva && y.check5m) {
          sent = true;
        }
      });
      if (!sent) {
        await createNotificacaoReserva5Min(x);
        reservasSent.push({ idreserva: x.idreserva, check5m: true });
      }
    }/*else if(x.check == "L"){
        limpezasSent.map((y) => {
            if (y.idreserva == x.idreserva && y.checkL) {
              sent = true;
            }
          });
          if (!sent) {
            await createPedidoLimpezaAutomatico(x);
            limpezasSent.push({ idreserva: x.idreserva, checkL: true });
          }
    }*/
  });
}, checkMinutos * 20 * 1000);

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
