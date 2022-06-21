const controllers = {}
var Centro = require('../models/centro');
var sequelize = require('../models/database');
const Sala = require('../models/sala');
const {centroSchema, editcentroSchema} = require('../schemas/centroSchema')
const createError = require('http-errors')

controllers.list = async(req, res,next) => {
    let {limit,offset} = req.body
    if(!req.query.limit || req.query.limit == 0){
        limit = 5;
    }
    if(!req.query.offset){
        offset = 0;
    }
    const data = await Centro.findAll();
    let x = { data };
    if (req.query.offset == 0 || !req.query.offset) {
      const count = await Centro.count();
      x.count = count;
    }
    res.send(x);
}
controllers.getCentro = async (req, res,next) => {
    let id = req.params.id
    if(Number.isInteger(+id)){
        const data = await Centro.findOne({
            where:{
                idcentro:id
            }
        })
        res.json({data:data});
    }
    else{
        return next(createError.BadRequest("Id is not a Integer"));
    }
};  
controllers.editCentro = async(req, res,next) => {
    const {id} = req.params
    if(Number.isInteger(+id)){
        const t = await sequelize.transaction();
        try {
            const result = await editcentroSchema.validateAsync(req.body);
            await Centro.update(result,{ where: { idcentro: id }},{transaction:t});
            await t.commit();
            res.send({data:"Centro updated!"});
        } catch (error) {
            await t.rollback();
            return next(error);
        } 
    }else{
        return next(createError.BadRequest("Id is not a Integer"));
    }
};
controllers.insertCentro = async(req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const result = await centroSchema.validateAsync(req.body);
        const centro = await Centro.create(result,{transaction:t});
        await t.commit();
        res.send({data:centro});
    } catch (error) {
        await t.rollback();
        return next(error);
    }

};
controllers.deleteCentro = async(req, res, next) => {
    const {id} = req.params
    if(Number.isInteger(+id)){
        const t = await sequelize.transaction();
        try {
            await Centro.destroy({
            where:{idcentro:id}},{transaction:t})
            await t.commit()
            res.sendStatus(204)
        } catch (error) {
            next(error)
        }  
    }else{
        return next(createError.BadRequest("Id is not a Integer"));
    }

};
controllers.getSalasCentro = async (req, res, next) => {
    const {id} = req.params;
    if(Number.isInteger(+id)){
    const data = await Centro.findAll({
        where:{idcentro:id},
        include:[{
            model:Sala.scope("noIdCentro"),
            where:{}
        }]
    })
    res.send({data:data});
    }else{
        return next(createError.BadRequest("Id is not a Integer"));
    }

};
controllers.getCentroFoto = async (req, res, next) => {
    try {
      const {id} = req.params
      if(!Number.isInteger(+id)){
        throw createError.BadRequest("Id is not a Integer");
      }
      const centro = await Centro.findByPk(id);
      if (!centro.foto) return next(createError.NotFound("Centro has no foto"));
      const readStream = fs.createReadStream(centro.imagem);
  
      readStream.on("open", function () {
        readStream.pipe(res);
      });
    } catch (err) {
      next(err);
    }
  };
module.exports = controllers;
