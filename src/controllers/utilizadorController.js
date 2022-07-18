const controllers = {};
var Utilizador = require("../models/utilizador");
var sequelize = require("../models/database");
const Centro = require("../models/centro");
const Reserva = require("../models/reserva");
const Sala = require("../models/sala");
const bcrypt = require("bcrypt");
const client = require("../models/redisDatabase");
const {handleImage} = require("../helpers/imageHandler");
const { Op } = require("sequelize");
const fs = require("fs");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../middlewares/jwt");
const {utilizadorSchema,editUtilizador,editUtilizadorAdmin} = require("../schemas/userSchema");
const createError = require("http-errors");
const xlsx = require('xlsx');
const EmpregadoLimpeza = require("../models/empregadoLimpeza");
const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken");
const {sendUpdateUtilizador} = require('../helpers/sockets')
const {sendFotoUtilizador,getFileUtilizador,deleteImagemUtilizador} = require('../helpers/s3')

const transporter = nodemailer.createTransport({
  service:'Gmail',
  auth:{
    user:process.env.GMAIL_USER,
    pass:process.env.GMAIL_APP_PASS
  }
});

controllers.list = async (req, res, next) => {
  try {
    let {centros,pesquisa,limit,offset} = req.query
    if (!limit || limit == 0) {
      limit = 5;
    }
    if (!offset) {
      offset = 0;
    }
    if(!centros){
      centros = new Array(0)
      const allCentros = await Centro.findAll({attributes:["idcentro"]});
      allCentros.map((x,i)=>{
        centros[i] = x.dataValues.idcentro
      })
    }
    let centroInt = centros.map((x)=>{return Number(x)})
    let data;
    if (pesquisa && !isNaN(pesquisa)) {
      data = await Utilizador.scope("noIdCentro").findAll({
        limit: limit,
        offset: offset,
        where:{
          [Op.and]:[{idutilizador:{[Op.not]:req.idUser}},{idcentro:{[Op.in]:centroInt}},{[Op.or]:[{nome:{[Op.like]: '%' + pesquisa + '%'}},{email:{[Op.like]: '%' + pesquisa + '%'}},{ncolaborador:pesquisa}]}]
        },
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
        order: [
          ['idutilizador', 'DESC']
      ]
      });
    } else {
      if(!pesquisa) pesquisa=""
      data = await Utilizador.scope("noIdCentro").findAll({
        limit: limit,
        offset: offset,
        where:{
          [Op.and]:[{idutilizador:{[Op.not]:req.idUser}},{idcentro:{[Op.in]:centroInt}},{[Op.or]:[{nome:{[Op.like]: '%' + pesquisa + '%'}},{email:{[Op.like]: '%' + pesquisa + '%'}}]}]
        },
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
        order: [
          ['idutilizador', 'DESC']
      ]
      });
    }
    for (let x of data) {
      if (x.dataValues.foto) {
        try {
            let idk = await getFileUtilizador(x.idutilizador)
            x.dataValues.fotoConv = idk;
        } catch (error) {
        }
        
      }
      
    }

    
    let x = { data };
    let count;
    if(pesquisa && !isNaN(pesquisa)){
      count = await Utilizador.count({where:{
        [Op.and]:[{idutilizador:{[Op.not]:req.idUser}},{idcentro:{[Op.in]:centroInt}},{[Op.or]:[{nome:{[Op.like]: '%' + pesquisa + '%'}},{email:{[Op.like]: '%' + pesquisa + '%'}},{ncolaborador:pesquisa}]}]
      }});
    }else{
      count = await Utilizador.count({where:{
        [Op.and]:[{idutilizador:{[Op.not]:req.idUser}},{idcentro:{[Op.in]:centroInt}},{[Op.or]:[{nome:{[Op.like]: '%' + pesquisa + '%'}},{email:{[Op.like]: '%' + pesquisa + '%'}}]}]
      }});
    }
    x.count = count;
    res.send(x);
  } catch (error) {
    next(error);
  }
};

controllers.countUtilizadoresByTipo = async (req, res, next) => {
  let countAdmin = await Utilizador.count({
    where:{
      admin:true
    }
  })
  let countAdminLimpeza = await EmpregadoLimpeza.count({
    where:{
      admin:true
    }
  })
  countAdmin -= countAdminLimpeza
  let countLimpeza = await EmpregadoLimpeza.count();
  let countUtilizadores = await Utilizador.count();
  countUtilizadores -= countLimpeza;
  countUtilizadores -= countAdmin
  res.send({data:{U:countUtilizadores,L:countLimpeza,admin:countAdmin}})
}

controllers.deleteUtilizador = async (req, res,next) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    
    if(!Number.isInteger(+id)){
      throw createError.BadRequest("Id is not a Integer");
    }
    const user = await Utilizador.findByPk(id);
    if(user.foto){
      fs.unlink(user.foto, (err, result) => {
        if (err) return err;
      });
    }
    await user.destroy({transaction:t})
    await t.commit();
    res.sendStatus(204);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

controllers.getUtilizador = async (req, res, next) => {
  try {
    const {id} = req.params
    if(!Number.isInteger(+id)){
      throw createError.BadRequest("Id is not a Integer");
    }
    const data = await Utilizador.scope("noPassword").findByPk(id, {
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
    if (data.dataValues.foto) {
      try {
        let idk = await getFileUtilizador(data.dataValues.idutilizador)
        data.dataValues.fotoConv = idk;
      } catch (error) {
        data.dataValues.fotoConv = "";
      }
      
    }
    res.send({ data: data });
  } catch (error) {
    next(error);
  }
};

controllers.bulkInsertUtilizador = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const workbook = xlsx.readFile(req.file.path)
    let worksheet = workbook.Sheets[workbook.SheetNames[0]]
    let worksheetLimpeza = workbook.Sheets[workbook.SheetNames[1]]
    const users = [];
    const usersLimpeza = [];
    let user = {};
    const payload = {};
      
    for(let cell in worksheet){
      const cellAsString = cell.toString();
      if(cellAsString[1] !== 'r' && cellAsString !== 'm' && cellAsString[1] > 1){
        if(cellAsString[0] === 'A'){
          user.admin = worksheet[cell].v;
        }
        if(cellAsString[0] === 'B'){
          user.nome = worksheet[cell].v
        }
        if(cellAsString[0] === 'C'){
          user.telemovel = worksheet[cell].v
        }
        if(cellAsString[0] === 'D'){
          user.email = worksheet[cell].v
        }
        if(cellAsString[0] === 'E'){
          user.password = await bcrypt.hash((worksheet[cell].v).toString(),10)
        }
        if(cellAsString[0] === 'F'){
          user.idcentro = worksheet[cell].v
          users.push(user);
          user = {}
        }
      }
    }
    for(let cell in worksheetLimpeza){
      const cellAsString = cell.toString();
      if(cellAsString[1] !== 'r' && cellAsString !== 'm' && cellAsString[1] > 1){
        if(cellAsString[0] === 'A'){
          user.admin = worksheetLimpeza[cell].v;
        }
        if(cellAsString[0] === 'B'){
          user.nome = worksheetLimpeza[cell].v
        }
        if(cellAsString[0] === 'C'){
          user.telemovel = worksheetLimpeza[cell].v
        }
        if(cellAsString[0] === 'D'){
          user.email = worksheetLimpeza[cell].v
        }
        if(cellAsString[0] === 'E'){
          user.password = await bcrypt.hash((worksheetLimpeza[cell].v).toString(),10)
        }
        if(cellAsString[0] === 'F'){
          user.idcentro = worksheetLimpeza[cell].v
          usersLimpeza.push(user);
          user = {}
        }
      }
    }

    if (req.file) {
      fs.unlink(req.file.path, (err, result) => {
        if (err) return err;
      });
    }
    await Utilizador.bulkCreate(users,{transaction:t})
    await EmpregadoLimpeza.bulkCreate(usersLimpeza,{transaction:t})
    await t.commit();
    res.sendStatus(204)
  } catch (error) {
    await t.rollback();
    if (req.file) {
      fs.unlink(req.file.path, (err, result) => {
        if (err) throw err;
      });
    }
    next(error)
  }
};

controllers.getUtilizadorReservas = async (req, res, next) => {
  try {
    const {id} = req.params
    if(!Number.isInteger(+id)){
      throw createError.BadRequest("Id is not a Integer");
    }
    const data = await Reserva.scope("noIdSala").findAll({
      where: [
        {
          idutilizador: id,
        },
      ],
      include: [
        {
          model: Sala,
        },  
        {
          model: Utilizador.scope("noPassword")
        }
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
        /*{
          admin: false,
          nome: "Andrioleto",
          idcentro: 1,
          telemovel: "931233123",
          email: "andrioleto@notadmin.com",
          password: await bcrypt.hash("123123", 10),
        },
        {
          admin: true,
          nome: "Consertino",
          idcentro: 1,
          telemovel: "931233127",
          email: "consertino@admin.com",
          password: await bcrypt.hash("123123", 10),
        },
        {
          admin: true,
          nome: "Alex",
          idcentro: 1,
          telemovel: "931233127",
          email: "alex@gmail.com",
          password: await bcrypt.hash("321321", 10),
        },
        {
          admin: false,
          nome: "Rodrigo Rodrigues",
          idcentro: 1,
          telemovel: "931233123",
          email: "rodrigorodrigues@softinsa.com",
          password: await bcrypt.hash("123123", 10),
        }
        ,*/
        {
          admin: false,
          nome: "requesitante 4",
          idcentro: 1,
          telemovel: "931233123",
          email: "requisitante4@softinsa.com",
          password: await bcrypt.hash("softinsa162", 10),
        },
        {
          admin: false,
          nome: "functionario 4",
          idcentro: 1,
          telemovel: "931233124",
          email: "funcionario4@softinsa.com",
          password: await bcrypt.hash("softinsa280", 10),
        },
        {
          admin: true,
          nome: "admin",
          idcentro: 1,
          telemovel: "931233123",
          email: "admin@softinsa.com",
          password: await bcrypt.hash("softinsa334", 10),
        }
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
  const {email,password} = req.body;
  if (!(email && password)) {
    return next(createError.BadRequest("Email or password missing!"));
  }

  const utilizador = await Utilizador.findOne({
    where: { email: email.toLowerCase() },
  });

  if (
    utilizador &&
    (await bcrypt.compare(password, utilizador.password))
  ) {
    if(!utilizador.verificado){
      const payload = {};
      const options = {
        expiresIn: "3d",
        subject: String(utilizador.idutilizador),
      };
      jwt.sign(payload,process.env.EMAIL_TOKEN_KEY,options,(err,emailToken)=>{
        if(err) return err
        const url = 'https://pint-web.vercel.app/verify/'+emailToken
  
        transporter.sendMail({
          to:utilizador.email,
          subject:'Confirm Email',
          html:`Please click this link to confirm your email: <a href="${url}">${url}</a>`
        });
      })
      return next(createError.Unauthorized("Confirm email first."));
    }
    let accessToken;
    let refreshToken;
    try {
      accessToken = await signAccessToken(utilizador.idutilizador);
      refreshToken = await signRefreshToken(utilizador.idutilizador,"mobile");
    } catch (error) {
      next(createError.InternalServerError());
      return;
    }

    res.send({ data: { accessToken, refreshToken } });
  } else {
    return next(createError.Unauthorized("Invalid Credentials!"));
  }
};

controllers.loginWeb = async (req, res, next) => {
  const {email,password} = req.body;
  if (!(email && password)) {
    return next(createError.BadRequest("Email or password missing!"));
  }

  const utilizador = await Utilizador.findOne({
    where: { email: email.toLowerCase() },
  });
  if (
    utilizador &&
    (await bcrypt.compare(password, utilizador.password))
  ) {
    if(!utilizador.verificado){
      const payload = {};
      const options = {
        expiresIn: "3d",
        subject: String(utilizador.idutilizador),
      };
      jwt.sign(payload,process.env.EMAIL_TOKEN_KEY,options,(err,emailToken)=>{
        if(err) return err
        const url = 'https://pint-web.vercel.app/verify/'+emailToken
  
        transporter.sendMail({
          to:utilizador.email,
          subject:'Confirm Email',
          html:`Please click this link to confirm your email: <a href="${url}">${url}</a>`
        });
      })
      return next(createError.Unauthorized("Confirm email first."));
    }
    if (utilizador.admin == true) {
      let accessToken;
      let refreshToken;
      try {
        accessToken = await signAccessToken(utilizador.idutilizador);
        refreshToken = await signRefreshToken(utilizador.idutilizador,"web");
      } catch (error) {
        next(createError.InternalServerError());
        return;
      }
      res.send({ data: { accessToken, refreshToken } });
    } else {
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
        attributes: {
          include: [
            [
              sequelize.literal(
                "(CASE WHEN utilizadores.tableoid::regclass::text = 'utilizadores' THEN 'U'  when utilizadores.tableoid::regclass::text = 'empregados_limpeza' THEN 'L' END)"
              ),
              "role",
            ],
          ]
        },
      }
    );
    if (utilizador.dataValues.foto) {
      let idk = await getFileUtilizador(req.idUser)
      utilizador.dataValues.fotoConv = idk;
    }
    res.send({ data: utilizador });
  } catch (error) {
    return next(error);
  }
};

controllers.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken,env } = req.body;
    if (!refreshToken || !env || env != "web" && env != "mobile") throw createError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);
    const accessToken = await signAccessToken(userId);
    const refToken = await signRefreshToken(userId,env);
    res.send({ data: { accessToken, refreshToken: refToken } });
  } catch (error) {
    next(error);
  }
};

controllers.logout = async (req, res, next) => {
  try {
    const { refreshToken,env } = req.body;
    if (!(refreshToken && env && (env === "web" || env === "mobile"))) throw createError.BadRequest();
    const id = await verifyRefreshToken(refreshToken);

    await client.HDEL(id,env);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

controllers.insertUtilizador = async (req, res, next) => {
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
      const user = await Utilizador.create(result, { transaction: t });

      const payload = {};
      const options = {
        expiresIn: "3d",
        subject: String(user.idutilizador),
      };
      jwt.sign(payload,process.env.EMAIL_TOKEN_KEY,options,(err,emailToken)=>{
        if(err) return err
        const url = 'https://pint-web.vercel.app/verify/'+emailToken

        transporter.sendMail({
          to:result.email,
          subject:'Confirm Email',
          html:`Please click this link to confirm your email: <a href="${url}">${url}</a>`
        });
      })

      if (req.file) {
        let x = await handleImage(
          req.file.path,
          user.idutilizador,
          "public/imgs/utilizadores/"
        );
        let path = "public/imgs/utilizadores/" + x;
        let s3Path = await sendFotoUtilizador(path,user.idutilizador);
        await t.commit();
        await user.update({ foto: s3Path });
      } else {
        await user.save();
        await t.commit();
      }
      sendUpdateUtilizador();
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

controllers.editUtilizador = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    
    if(isNaN(id)){
      if (req.file) {
        fs.unlink(req.file.path, (err, result) => {
          if (err) throw err;
        });
      }
      throw createError.BadRequest("Id is not a Integer");
    }
    const utilizador = await Utilizador.scope("noPassword").findByPk(
      req.idUser
    );
    if (utilizador.admin) {
      const result = await editUtilizadorAdmin.validateAsync(req.body);
      let emailExists;
      if(result.email){
          emailExists = await Utilizador.findOne({
        where: { email: result.email },
      });
      }    

      if (emailExists) {
        if(emailExists.idutilizador != id){
          if (req.file) {
            fs.unlink(req.file.path, (err, result) => {
              if (err) throw err;
            });
          }
          throw createError.Conflict(`${result.email} has already been registered`)
        }
      }
      bcrypt.hash(result.password, 10, async function (err, hash) {
        result.password = hash;
        await Utilizador.update(
          result,
          { where: { idutilizador: req.params.id } },
          { transaction: t }
        );
        if (req.file) {
          let x = await handleImage(
            req.file.path,
            req.params.id,
            "public/imgs/utilizadores/"
          );
          let path = "public/imgs/utilizadores/" + x;
          let s3Path = await sendFotoUtilizador(path,req.params.id);
          await t.commit();
          await Utilizador.update({ foto: s3Path },{ where: { idutilizador: req.params.id } });
        } else {
          await t.commit();
        }
      });
    } else {
      if (req.idUser == req.params.id) {
        if (req.body.password) {
          const result = await editUtilizador.validateAsync(req.body);
          await Utilizador.update(
            result,
            { where: {idutilizador:req.idUser} },
            { transaction: t }
          );
          if (req.file) {
            let x = await handleImage(
              req.file.path,
              req.params.id,
              "public/imgs/utilizadores/"
            );
            let path = "public/imgs/utilizadores/" + x;
            let s3Path = await sendFotoUtilizador(path,req.idUser);
            await utilizador.update({ foto: s3Path },{ where: { idutilizador: req.idUser }},{transaction:t});
            } 
          await t.commit();
        }
      }else{
        if (req.file) {
          fs.unlink(req.file.path, (err, result) => {
            if (err) throw err;
          });
        }
        throw createError.Unauthorized()
      }
    }
    sendUpdateUtilizador()
    res.send({ data: "Utilizador updated!" });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

controllers.getUtilizadorFoto = async (req, res, next) => {
  try {
    const {id} = req.params
    if(!Number.isInteger(+id)){
      throw createError.BadRequest("Id is not a Integer");
    }
      const image = await getFileUtilizador(id)
      res.send({data:image})
  } catch (err) {
    next(err);
  }
};

controllers.deleteUtilizadorFoto = async(req,res,next) => {
  const t = await sequelize.transaction()
  const {id} = req.params;
  try {
      if(isNaN(id)) throw createError.BadRequest("Id is not a Integer");
      const user = await Utilizador.findByPk(id);
      if(!(user && user.foto)) throw createError.NotFound("This utilizador has no image");
      await deleteImagemUtilizador(id);
      await user.update({foto:""},{transaction:t})
      await t.commit()
      res.sendStatus(204)
  } catch (error) {
      await t.rollback()
      next(error)
  }
}

controllers.makeEmpregadoLimpeza = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    let {id} = req.params;
  if (isNaN(id)) return next(createError[422]("Id is not an Integer!"))
    const utilizadorRaw = await Utilizador.findByPk(id,{raw: true,transaction:t});
    const utilizador = await Utilizador.findByPk(id,{transaction:t});
    await utilizador.destroy({transaction:t})
    const empregadoLimpeza = await EmpregadoLimpeza.create(utilizadorRaw,{transaction:t})
    await t.commit();
    res.send({ data: empregadoLimpeza });
  } catch (error) {
    await t.rollback();
    next(error)
  }
};

controllers.confirmarUtilizador = async (req, res, next) => {
  const t = await sequelize.transaction()
  try {
      const token = req.params.token
      if (!token) {
        throw next(createError.BadRequest("Token missing"));
      }
      jwt.verify(token, process.env.EMAIL_TOKEN_KEY, async(err, payload) => {
        if (err) {
          const message =
            err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
            throw next(createError.Unauthorized(message));
        }
        await Utilizador.update({verificado:true},{where:{idutilizador: payload.sub}})
        await t.commit()
      });
      res.sendStatus(204)
  } catch (error) {
    await t.rollback()
    next(error)
  }
}

controllers.testMail = async (req,res,next) => {
  const result = {}
  result.email = req.body.email
  const payload = {};
      const options = {
        expiresIn: "1d",
        subject: String("Atum"),
      };
  jwt.sign(payload,process.env.EMAIL_TOKEN_KEY,options,(err,emailToken)=>{
    if(err) return err
    const url = 'https://pint-web.vercel.app/atum/'+emailToken

    transporter.sendMail({
      to:result.email,
      subject:'Confirm Email',
      html:`Please click this link to confirm your email: <a href="${url}">${url}</a>`
    });
  })
  res.send("Ola")
}

controllers.updateOwnPass = async (req,res,next) =>{
  const t = await sequelize.transaction();
  try {
    const {oldPass,newPass} = req.body
    const utilizador = await Utilizador.findByPk(req.idUser);
    if (!(utilizador && (await bcrypt.compare(oldPass, utilizador.password)))) throw next(createError.BadRequest("Passwords don't match"))
    bcrypt.hash(newPass, 10, async function (err, hash) {
      if(utilizador.firstlogin == true){
        await Utilizador.update(
          {password:hash,firstlogin:false},
          { where: { idutilizador: req.idUser } },
          { transaction: t }
        );
      }else{
        await Utilizador.update(
          {password:hash},
          { where: { idutilizador: req.idUser } },
          { transaction: t }
        );
      }
      
    });
    await t.commit()
    res.sendStatus(204)
  } catch (error) {
    await t.rollback();
    next(error)
  }
}

controllers.getReservasDecorrer = async (req, res, next) => {
  try {
    const {id} = req.params
    if(isNaN(id)) return next(createError.BadRequest("Not a number"))
    let now = new Date()
    let time = now.getHours() + ":"+ now.getMinutes()+":"+now.getSeconds();
    const data = await Reserva.findAll({
      where: {
            [Op.and]: [
              {
                horafinal:{[Op.gte]:time}
              },{
                horainicio: {
                  [Op.lte]: time,
                },
              },{
                data:now
              },{
                [Op.not]:[{
                  horafinal:{[Op.lte]:time}
                }]
                
              },{
                idutilizador:id
              }
            ],
      },
      include: [
        {
          model: Sala,
        },
      ],
    });
    res.send({ data });
  } catch (error) {
    next(error);
  }
};

controllers.getReservasAntigas = async (req, res, next) => {
  try {
    const {id} = req.params
    if(isNaN(id)) return next(createError.BadRequest("Not a number"))
    let now = new Date()
    let time = now.getHours() + ":"+ now.getMinutes()+":"+now.getSeconds();
    const data = await Reserva.findAll({
      where: {
            [Op.and]: [
              {
                [Op.or]:[{
                  data:{[Op.lte]:now}
                  
                },{
                  [Op.and]:[{
                    horafinal:{[Op.lt]:time}
                  },{
                    data:now
                  }]
                }]
              },{
                idutilizador:id
              }
            ],
      },
      include: [
        {
          model: Sala,
        },
      ],
    });
    res.send({ data });
  } catch (error) {
    next(error);
  }
};
module.exports = controllers;
