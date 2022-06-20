const controllers = {};
var Utilizador = require("../models/utilizador");
var sequelize = require("../models/database");
const Centro = require("../models/centro");
const Reserva = require("../models/reserva");
const Sala = require("../models/sala");
const bcrypt = require("bcrypt");
const client = require("../models/redisDatabase");
const handleImage = require('../helpers/imageHandler')
const fs = require('fs')
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../middlewares/jwt");
const utilizadorSchema = require('../schemas/userSchema')
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
          email: "andrioleto@notadmin.com",
          password: await bcrypt.hash("123123", 10),
        },
        {
          ncolaborador: "133",
          admin: true,
          nome: "Consertino",
          idcentro: 1,
          telemovel: "931233127",
          email: "consertino@admin.com",
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
    where: { email: req.body.email.toLowerCase() },
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

controllers.loginWeb = async (req, res, next) => {
  if (!(req.body.email && req.body.password)) {
    return next(createError.BadRequest("Email or password missing!"));
  }

  const utilizador = await Utilizador.findOne({
    where: { email: req.body.email.toLowerCase() },
  });
  if (
    utilizador &&
    (await bcrypt.compare(req.body.password, utilizador.password)) 
  ) {
    if(utilizador.admin == true){
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
    }
    else{
      return next(createError.Forbidden("Not enough permissions!"));
    }

   
  } else {
    return next(createError.Unauthorized("Invalid Credentials!"));
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

controllers.insertUtilizador = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const result = await utilizadorSchema.validateAsync(req.body);
    const emailExists = await Utilizador.findOne({where:{email : result.email}});
    const nColaboradorExists = await Utilizador.findOne({where:{ncolaborador : result.ncolaborador}})

    if(emailExists){
      if(req.file){
        fs.unlink(req.file.path,(err,result)=>{
          if(err)
            next (err);
        })
      }
      return next(createError.Conflict(`${result.email} has already been registered`))
    } 
    if(nColaboradorExists){
      if(req.file){
        fs.unlink(req.file.path,(err,result)=>{
          if(err)
            next (err);
        })
      }
      return next(createError.Conflict(`${result.ncolaborador} has already been registered`))
    } 
    bcrypt.hash(result.password, 10, async function (err, hash) {
      result.password = hash
      const user = await Utilizador.create(result,{ transaction: t });
      if(req.file){
        let x = await handleImage(req.file.path,user.idutilizador,'public/imgs/utilizadores/') 
        let path ='public/imgs/utilizadores/' + x;
        await t.commit();
        await user.update({foto:path})
      }else{
        await user.save()
        await t.commit()
      }
      
      res.send({ data: user });
    });
  } catch (error) {
    if(req.file){
      fs.unlink(req.file.path,(err,result)=>{
        if(err)
          next (err);
      })
    }
    if(error.isJoi === true) error.status = 422
    await t.rollback();
    next(error);
  }
};

controllers.editUtilizadorTest = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const {id} = req.params;
    if(!id){
      next(createError.BadRequest())
    }
    const result = await utilizadorSchema.validateAsync(req.body);
    const utilizador = await Utilizador.scope("noPassword").findByPk(req.idUser)
    if(utilizador.admin){
      const emailExists = await Utilizador.findOne({where:{email : result.email}});
      const nColaboradorExists = await Utilizador.findOne({where:{ncolaborador : result.ncolaborador}})

      if(emailExists){
        if(req.file){
          fs.unlink(req.file.path,(err,result)=>{
            if(err)
              next (err);
          })
        }
        return next(createError.Conflict(`${result.email} has already been registered`))
      } 
      if(nColaboradorExists){
        if(req.file){
          fs.unlink(req.file.path,(err,result)=>{
            if(err)
              next (err);
          })
        }
        return next(createError.Conflict(`${result.ncolaborador} has already been registered`))
      } 
      bcrypt.hash(result.password, 10, async function (err, hash) {
        result.password = hash
        const user = await Utilizador.update(result,{where:{idutilizador:req.params.id}},{ transaction: t });
        if(req.file){
          let x = await handleImage(req.file.path,user.idutilizador,'public/imgs/utilizadores/') 
          let path ='public/imgs/utilizadores/' + x;
          await t.commit();
          await user.update({foto:path})
        }else{
          await t.commit()
        }
        
        res.send({ data: user });
      });
    }else{
      if(req.body.password){
        bcrypt.hash(result.password, 10, async function (err, hash) {
          result.password = hash
          const user = await Utilizador.create({nome:result.nome,telemovel:result.telemovel},{where:{}},{ transaction: t });
          if(req.file){
            let x = await handleImage(req.file.path,user.idutilizador,'public/imgs/utilizadores/') 
            let path ='public/imgs/utilizadores/' + x;
            await t.commit();
            await user.update({foto:path})
          }else{
            await user.save()
            await t.commit()
          }
          
          res.send({ data: user });
        });
      }
    }
    res.sendStatus(204);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

controllers.getUtilizadorFoto = async (req, res, next) => {
  try {
    const user = await Utilizador.findByPk(req.params.id);
    if(!user.foto)
    return next(createError.NotFound("Utilizador has no foto"))
    const readStream = fs.createReadStream(user.foto)

    readStream.on('open', function () {
    readStream.pipe(res);
  });
  } catch(err) {
    next(err)
  }
};

module.exports = controllers;
