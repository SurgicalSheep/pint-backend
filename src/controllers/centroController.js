const controllers = {};
var Centro = require("../models/centro");
var sequelize = require("../models/database");
const Sala = require("../models/sala");
const { centroSchema, editcentroSchema } = require("../schemas/centroSchema");
const createError = require("http-errors");
const { handleImageCentro } = require("../helpers/imageHandler");
const fs = require("fs");

controllers.list = async (req, res, next) => {
  let { limit, offset } = req.body;
  if (!req.query.limit || req.query.limit == 0) {
    limit = 5;
  }
  if (!req.query.offset) {
    offset = 0;
  }
  const data = await Centro.findAll();
  console.log(data[0].dataValues.imagem);
  data.forEach((x, i) => {
    if (x.dataValues) {
      if (x.dataValues.imagem) {
        try {
          let idk = fs.readFileSync(
            x.dataValues.imagem,
            "base64",
            (err, val) => {
              if (err) return err;
              console.log("lul");
              return val;
            }
          );
          x.dataValues.imagemConv = idk;
        } catch (error) {}
      }
    }
  });

  let x = { data };
  const count = await Centro.count();
  x.count = count;
  res.send(x);
};
controllers.getCentro = async (req, res, next) => {
  let id = req.params.id;
  if (Number.isInteger(+id)) {
    const data = await Centro.findOne({
      where: {
        idcentro: id,
      },
    });
        if (data.dataValues.imagem) {
          try {
            let idk = fs.readFileSync(
              data.dataValues.imagem,
              "base64",
              (err, val) => {
                if (err) return err;
                return val;
              }
            );
            data.dataValues.fotoConv = idk;
          } catch (error) {
            data.dataValues.fotoConv = ""
          } 
          }
    res.json({ data: data });
  } else {
    return next(createError.BadRequest("Id is not a Integer"));
  }
};
controllers.editCentro = async (req, res, next) => {
  const { id } = req.params;
  if (Number.isInteger(+id)) {
    const t = await sequelize.transaction();
    try {
      const result = await editcentroSchema.validateAsync(req.body);
      await Centro.update(
        result,
        { where: { idcentro: id } },
        { transaction: t }
      );
      if (req.file) {
        let x = await handleImageCentro(
          req.file.path,
          id,
          "public/imgs/centros/"
        );
        let path = "public/imgs/centros/" + x;
        await Centro.update(
          { imagem: path },
          { where: { idcentro: id } },
          { transaction: t }
        );
      }
      await t.commit();
      res.send({ data: "Centro updated!" });
    } catch (error) {
      await t.rollback();
      if (req.file) {
        fs.unlink(req.file.path, (err, result) => {
          if (err) return err;
        });
      }
      return next(error);
    }
  } else {
    if (req.file) {
      fs.unlink(req.file.path, (err, result) => {
        if (err) return err;
      });
    }
    return next(createError.BadRequest("Id is not a Integer"));
  }
};
controllers.insertCentro = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    if (!req.file) {
      throw createError.BadRequest("Image is required");
    }
    const result = await centroSchema.validateAsync(req.body);
    const centro = await Centro.create(result, { transaction: t });
    let x = await handleImageCentro(
      req.file.path,
      centro.idcentro,
      "public/imgs/centros/"
    );
    let path = "public/imgs/centros/" + x;
    await centro.update({ imagem: path }, { transaction: t });
    await t.commit();
    res.send({ data: centro });
  } catch (error) {
    await t.rollback();
    if (req.file) {
      fs.unlink(req.file.path, (err, result) => {
        if (err) return err;
      });
    }
    return next(error);
  }
};
controllers.deleteCentro = async (req, res, next) => {
  const { id } = req.params;
  if (Number.isInteger(+id)) {
    const t = await sequelize.transaction();
    try {
      const centro = await Centro.findByPk(id);
      if (centro.imagem) {
        fs.unlink(centro.imagem, (err, result) => {
          if (err) return err;
        });
      }
      await centro.destroy({ transaction: t });
      await t.commit();
      res.sendStatus(204);
    } catch (error) {
      await t.rollback();
      next(error);
    }
  } else {
    return next(createError.BadRequest("Id is not a Integer"));
  }
};
controllers.getSalasCentro = async (req, res, next) => {
  const { id } = req.params;
  if (Number.isInteger(+id)) {
    const data = await Centro.findAll({
      where: { idcentro: id },
      include: [
        {
          model: Sala.scope("noIdCentro"),
          where: {},
        },
      ],
    });
    res.send({ data: data });
  } else {
    return next(createError.BadRequest("Id is not a Integer"));
  }
};
controllers.getCentroImagem = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!Number.isInteger(+id)) {
      throw createError.BadRequest("Id is not a Integer");
    }
    const centro = await Centro.findByPk(id);
    if (!centro || !centro.imagem)
      return next(createError.NotFound("This centro has no image"));
    const readStream = fs.createReadStream(centro.imagem);
    readStream.on("error", function (err) {
      return next(err);
    });
    readStream.on("open", function () {
      readStream.pipe(res);
    });
  } catch (err) {
    next(err);
  }
};
controllers.deleteCentroImagem = async (req, res, next) => {
  const t = await sequelize.transaction();
  const { id } = req.params;
  try {
    if (!Number.isInteger(+id))
      throw createError.BadRequest("Id is not a Integer");
    const centro = await Centro.findByPk(id);
    if (!(centro && centro.imagem))
      throw createError.NotFound("This centro has no image");
    fs.unlink("public\\imgs\\centros\\" + id + ".jpeg", (err, result) => {
      if (err) return err;
    });
    await centro.update({ imagem: "" }, { transaction: t });
    await t.commit();
    res.sendStatus(204);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};
module.exports = controllers;
