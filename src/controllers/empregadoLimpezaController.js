const controllers = {};
var EmpregadoLimpeza = require("../models/empregadoLimpeza");
var Utilizador = require("../models/utilizador");
var sequelize = require("../models/database");
const Sequelize = require("sequelize");
const Centro = require("../models/centro");
const Op = Sequelize.Op;
const createError = require('http-errors')

controllers.list = async (req, res, next) => {
  try {
    let { centro, pesquisa, limit, offset } = req.query;
    if (!limit || limit == 0) {
      limit = 5;
    }
    if (!offset) {
      offset = 0;
    }
    if (!centro) {
      centro = new Array(0);
      const centros = await Centro.findAll({ attributes: ["idcentro"] });
      centros.map((x, i) => {
        centro[i] = x.dataValues.idcentro;
      });
    }
    let centroInt = centro.map((x) => {
      return Number(x);
    });
    let data;
    if (pesquisa && !isNaN(pesquisa)) {
      data = await EmpregadoLimpeza.findAll({
        limit: limit,
        offset: offset,
        where: {
          [Op.and]: [
            { idutilizador: { [Op.not]: req.idUser } },
            { idcentro: { [Op.in]: centroInt } },
            {
              [Op.or]: [
                { nome: { [Op.like]: "%" + pesquisa + "%" } },
                { email: { [Op.like]: "%" + pesquisa + "%" } },
                { ncolaborador: pesquisa },
              ],
            },
          ],
        },
        include: [
          {
            model: Centro,
          },
        ],
        attributes: {
          exclude: ["password"],
        },
        order: [["idutilizador", "DESC"]],
      });
    } else {
      if (!pesquisa) pesquisa = "";
      data = await EmpregadoLimpeza.findAll({
        limit: limit,
        offset: offset,
        where: {
          [Op.and]: [
            { idutilizador: { [Op.not]: req.idUser } },
            { idcentro: { [Op.in]: centroInt } },
            {
              [Op.or]: [
                { nome: { [Op.like]: "%" + pesquisa + "%" } },
                { email: { [Op.like]: "%" + pesquisa + "%" } },
              ],
            },
          ],
        },
        include: [
          {
            model: Centro,
          },
        ],
        attributes: {
          exclude: ["password"],
        },
        order: [["idutilizador", "DESC"]],
      });
    }

    data.forEach((x, i) => {
      if (x.dataValues.foto) {
        try {
          let idk = fs.readFileSync(x.dataValues.foto, "base64", (err, val) => {
            if (err) return err;
            return val;
          });
          x.dataValues.fotoConv = idk;
        } catch (error) {}
      }
    });

    let x = { data };
    let count;
    if (pesquisa && !isNaN(pesquisa)) {
      count = await EmpregadoLimpeza.count({
        where: {
          [Op.and]: [
            { idutilizador: { [Op.not]: req.idUser } },
            { idcentro: { [Op.in]: centroInt } },
            {
              [Op.or]: [
                { nome: { [Op.like]: "%" + pesquisa + "%" } },
                { email: { [Op.like]: "%" + pesquisa + "%" } },
                { ncolaborador: pesquisa },
              ],
            },
          ],
        },
      });
    } else {
      count = await EmpregadoLimpeza.count({
        where: {
          [Op.and]: [
            { idutilizador: { [Op.not]: req.idUser } },
            { idcentro: { [Op.in]: centroInt } },
            {
              [Op.or]: [
                { nome: { [Op.like]: "%" + pesquisa + "%" } },
                { email: { [Op.like]: "%" + pesquisa + "%" } },
              ],
            },
          ],
        },
      });
    }
    x.count = count;
    res.send(x);
  } catch (error) {
    next(error);
  }
};
controllers.editEmpregadoLimpeza = async (req, res) => {
  let id = req.params.id;
  if (Number.isInteger(+id)) {
    const t = await sequelize.transaction();
    try {
      bcrypt.hash(req.body.password, 10, async function (err, hash) {
        await EmpregadoLimpeza.update(
          {
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
            disponibilidade: req.body.disponibilidade,
          },
          { where: { idutilizador: id }, transaction: t }
        );
      })
      
      await t.commit();
      res.status(200).send("Ok");
    } catch (error) {
      await t.rollback();
      res.status(400).send(error);
    }
  } else {
    res.status("422").send("Id is not an Integer!");
  }
};
controllers.insertEmpregadoLimpeza = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const result = await utilizadorSchema.validateAsync(req.body);
    const emailExists = await Utilizador.findOne({
      where: { email: result.email },
    });

    if (emailExists) {
      if (req.file) {
        fs.unlink(req.file.path, (err, result) => {
          if (err) throw err;
        });
      }
      throw createError.Conflict(`${result.email} has already been registered`)
    }
    bcrypt.hash(result.password, 10, async function (err, hash) {
      result.password = hash;
      const user = await EmpregadoLimpeza.create(result, { transaction: t });
      if (req.file) {
        let x = await handleImage(
          req.file.path,
          user.idutilizador,
          "public/imgs/utilizadores/"
        );
        let path = "public/imgs/utilizadores/" + x;
        await t.commit();
        await user.update({ foto: path });
      } else {
        await user.save();
        await t.commit();
      }
      const io = req.app.get('socketio');
      io.emit('newUser',"newUser")
      res.send({ data: user });
    });
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, (err, result) => {
        if (err) throw err;
      });
    }
    if (error.isJoi === true) error.status = 422;
    await t.rollback();
    next(error);
  }
};
controllers.deleteEmpregadoLimpeza = async (req, res, next) => {
  let {id} = req.params;
  if (isNaN(id)) return next(createError[422]("Id is not an Integer!"));
    const t = await sequelize.transaction();
    try {
      await EmpregadoLimpeza.destroy({ where: { idutilizador: id } });
      await t.commit();
      res.sendStatus(204);
    } catch (error) {
      await t.rollback();
      next(error)
    }
};
controllers.getEmpregadoLimpeza = async (req, res, next) => {
  let {id} = req.params;
  if (!isNaN(id)) {
    const data = await EmpregadoLimpeza.scope("noPassword").findByPk(id, { include: [{ model: Centro }] });
    if (data.dataValues.foto) {
      try {
        let idk = fs.readFileSync(
          data.dataValues.foto,
          "base64",
          (err, val) => {
            if (err) return err;
            return val;
          }
        );
        data.dataValues.fotoConv = idk;
      } catch (error) {
        data.dataValues.fotoConv = "";
      }
      
    }
    res.send({ data: data });
  } else {
    createError[422]("Id is not an Integer!")
  }
};
controllers.makeUtilizador = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    let {id} = req.params;
  if (isNaN(id)) return next(createError[422]("Id is not an Integer!"))
    const empregadoLimpezaRaw = await EmpregadoLimpeza.findByPk(id,{raw: true,transaction:t});
    const empregadoLimpeza = await EmpregadoLimpeza.findByPk(id,{transaction:t});
    await empregadoLimpeza.destroy({transaction:t})
    const utilizador = await Utilizador.create(empregadoLimpezaRaw,{transaction:t})
    await t.commit();
    res.send({ data: utilizador });
  } catch (error) {
    await t.rollback();
    next(error)
  }
};
module.exports = controllers;
