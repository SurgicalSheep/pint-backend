const controllers = {};
var Utilizador = require("../models/Utilizador");
var sequelize = require("../models/Database");
const Sequelize = require("sequelize");
const Centro = require("../models/Centro");
const Reserva = require("../models/Reserva");
const Sala = require("../models/Sala");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const client = require("../models/redisDatabase");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../middlewares/jwt");
const createError = require("http-errors");

controllers.list = async (req, res, next) => {
  try {
    let limit = req.query.limit;
    let offset = req.query.offset;
    if (!req.query.limit || req.query.limit == 0) {
      limit = 5;
    }
    if (!req.query.offset) {
      offset = 0;
    }
    const data = await Utilizador.scope("noIdCentro").findAll({
      limit: limit,
      offset: offset,
      include: [
        {
          model: Centro,
        },
      ],
      attributes: {
        include: [
          [
            sequelize.literal(
              "(CASE WHEN utilizadores.tableoid::regclass::text = 'utilizadores' THEN 'U'  when utilizadores.tableoid::regclass::text = 'empregados_limpeza' THEN 'L' END)"
            ),
            "role",
          ],
        ],
        exclude: ["password"],
      },
    });
    let x = { data };
    if (req.query.offset == 0 || !req.query.offset) {
      const count = await Utilizador.count();
      x.count = count;
    }
    res.send(x);
  } catch (error) {
    next(error);
  }
};
controllers.editUtilizador = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    await Utilizador.update(
      {
        ncolaborador: req.body.ncolaborador,
        admin: req.body.admin,
        nome: req.body.nome,
        idcentro: req.body.idcentro,
        telemovel: req.body.telemovel,
        email: req.body.email,
        password: req.body.password,
        estado: req.body.estado,
        firstlogin: req.body.firstlogin,
        verificado: req.body.verificado,
        token: req.body.token,
        foto: req.body.foto,
      },
      { where: { idutilizador: req.params.id }, transaction: t }
    );
    await t.commit();
    res.sendStatus(204);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};
controllers.insertUtilizador = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    bcrypt.hash(req.body.password, 10, async function (err, hash) {
      const user = await Utilizador.create(
        {
          ncolaborador: req.body.ncolaborador,
          admin: req.body.admin,
          nome: req.body.nome,
          idcentro: req.body.idcentro,
          telemovel: req.body.telemovel,
          email: req.body.email,
          password: hash,
          estado: req.body.estado,
          firstlogin: req.body.firstlogin,
          verificado: req.body.verificado,
          token: req.body.token,
          foto: req.body.foto,
        },
        { transaction: t }
      );
      await t.commit();
      res.send({ data: user });
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

controllers.deleteUtilizador = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    await Utilizador.destroy(
      { where: { idutilizador: req.params.id } },
      { transaction: t }
    );
    await t.commit();
    res.sendStatus(204);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};
controllers.getUtilizador = async (req, res, next) => {
  try {
    const data = await Utilizador.scope("noPassword").findByPk(req.params.id, {
      attributes: {
        include: [
          [
            sequelize.literal(
              "(CASE WHEN utilizadores.tableoid::regclass::text = 'utilizadores' THEN 'U'  when utilizadores.tableoid::regclass::text = 'empregados_limpeza' THEN 'L' END)"
            ),
            "role",
          ],
        ],
      },
    });
    res.send({ data: data });
  } catch (error) {
    next(error);
  }
};
controllers.bulkInsertUtilizador = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    await Utilizador.bulkCreate(req.body, { transaction: t });
    await t.commit();
    res.status(200).send("1");
  } catch (error) {
    await t.rollback();
    res.status(400).send(error);
  }
};
controllers.getUtilizadorReservas = async (req, res, next) => {
  try {
    const data = await Reserva.scope("noIdSala").findAll({
      where: [
        {
          idutilizador: req.params.id,
        },
      ],
      include: [
        {
          model: Sala,
        },
      ],
    });
    res.send({ data: data });
  } catch (error) {
    next(error);
  }
};

controllers.insertTestUtilizadores = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    await Utilizador.bulkCreate(
      [
        {
          ncolaborador: "132",
          admin: false,
          nome: "Andrioleto",
          idcentro: 1,
          telemovel: "931233123",
          email: "Andrioleto@NotAdmin.com",
          password: await bcrypt.hash("123123", 10),
        },
        {
          ncolaborador: "133",
          admin: true,
          nome: "Consertino",
          idcentro: 1,
          telemovel: "931233127",
          email: "Consertino@Admin.com",
          password: await bcrypt.hash("123123", 10),
        },
      ],
      { transaction: t }
    );
    await t.commit();
    res.sendStatus(204);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

controllers.login = async (req, res, next) => {
  if (!(req.body.email && req.body.password)) {
    return next(createError.BadRequest("Email or password missing!"));
  }

  const utilizador = await Utilizador.findOne({
    where: { email: req.body.email },
  });
  if (
    utilizador &&
    (await bcrypt.compare(req.body.password, utilizador.password))
  ) {
    let accessToken;
    let refreshToken;
    try {
      accessToken = await signAccessToken(utilizador.idutilizador);
      refreshToken = await signRefreshToken(utilizador.idutilizador);
    } catch (error) {
      next(createError.InternalServerError());
      return;
    }

    res.send({ data: { accessToken, refreshToken } });
  } else {
    return next(createError.BadRequest("Invalid Credentials!"));
  }
};

controllers.getUserByToken = async (req, res, next) => {
  try {
    const utilizador = await Utilizador.scope("noPassword").findByPk(
      req.idUser,
      {
        include: [
          {
            model: Centro,
          },
        ],
      }
    );
    res.send({ data: utilizador });
  } catch (error) {
    return next(error);
  }
};

controllers.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);
    const accessToken = await signAccessToken(userId);
    const refToken = await signRefreshToken(userId);
    res.send({ data: { accessToken, refreshToken: refToken } });
  } catch (error) {
    next(error);
  }
};

controllers.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError.BadRequest();
    const id = await verifyRefreshToken(refreshToken);
    await client.DEL(id);
    res.sendStatus(204);
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

module.exports = controllers;
