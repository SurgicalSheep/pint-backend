const jwt = require("jsonwebtoken");
const db = require("../models/Database");
const Utilizador = require("../models/Utilizador");
var redis = require('redis')
var redisClient = redis.createClient();

const verifyToken = (req, res, next) => {
  const token =
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"] ||
    req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).send("A token is required for authentication");
  }
  jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Acesso não autorizado!",
      });
    }
    req.idUtilizador = decoded.id;
    next();
  });
};

const isAdmin = async (req, res, next) => {
  let user = await Utilizador.findByPk(req.idUtilizador);
  if (user.admin == true) {
    next();
    return;
  } else {
    res.status(403).send({ message: "Sem permissões!" });
    return;
  }
};
module.exports = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
};
