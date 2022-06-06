const controllers = {};
var Utilizador = require("../models/Utilizador");
var sequelize = require("../models/Database");
const Sequelize = require("sequelize");
const Centro = require("../models/Centro");
const Reserva = require("../models/Reserva");
const Sala = require("../models/Sala");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

controllers.list = async (req, res) => {
  const data = await Utilizador.scope("noIdCentro").findAll({
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
  res.json({ utilizadores: data });
};
controllers.editUtilizador = async (req, res) => {
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
    res.status(200).send("1");
  } catch (err) {
    await t.rollback();
    res.status(400).send("Err");
  }
};
controllers.insertUtilizador = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    bcrypt.hash(req.body.password, 10, async function (err, hash) {
      await Utilizador.create(
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
      console.log(hash);
      await t.commit();
      res.status(200).send("1");
    });
  } catch (error) {
    await t.rollback();
    res.status(400).send(error);
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
    res.status(200).send("1");
  } catch {
    await t.rollback();
    res.status(400).send("Err");
  }
};
controllers.getUtilizador = async (req, res) => {
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
  res.json({ utilizador: data });
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
controllers.getUtilizadorReservas = async (req, res) => {
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
  res.json({ reservas: data });
};

controllers.insertTestUtilizadores = async (req, res) => {
  const t = await sequelize.transaction();
  try {
      await Utilizador.bulkCreate([
        {
          ncolaborador: "132",
          admin: false,
          nome: "Andrioleto",
          idcentro: 1,
          telemovel: "931233123",
          email: "Andrioleto@NotAdmin.com",
          password: await bcrypt.hash("123123", 10)
        },
        {
          ncolaborador: "133",
          admin: true,
          nome: "Consertino",
          idcentro: 1,
          telemovel: "931233127",
          email: "Consertino@Admin.com",
          password: await bcrypt.hash("123123", 10)
        }],
        { transaction: t }
      );
      await t.commit();
      res.status(200).send("Ok");
  } catch (error) {
    await t.rollback(); 
    res.status(400).send(error);
  }
};

controllers.login = async (req, res) => {
  if (!(req.body.email && req.body.password)) {
    res.status(400).send("Email or password missing!");
  }

  const utilizador = await Utilizador.findOne({
    where: { email: req.body.email },
  });
  if (
    utilizador &&
    (await bcrypt.compare(req.body.password, utilizador.password))
  ) {
    const token = jwt.sign(
      { id: utilizador.idutilizador},
      process.env.TOKEN_KEY,
      {
        expiresIn: "30m",
      }
    );
    res.json({ token: token });
  } else {
    res.status("400").send("Invalid Credentials!");
  }
};

module.exports = controllers;
