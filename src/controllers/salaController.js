const controllers = {};
var Centro = require("../models/Centro");
var Sala = require("../models/Sala");
var sequelize = require("../models/Database");
const Sequelize = require("sequelize");
const { request } = require("express");
const Op = Sequelize.Op;

controllers.list = async (req, res) => {
  let limit=req.query.limit;
  let offset=req.query.offset;
  if(!req.query.limit || req.query.limit == 0){
    limit = 5;
  }
  if(!req.query.offset){
    offset = 0;
  }
  const data = await Sala.findAll({
    limit: limit,
    offset: offset
  });
  let x = {data};
  if (req.query.offset == 0 || !req.query.offset) {
    const count = await Sala.count();   
    x.count = count;
  }
  
  res.status(200).json(x);
};

controllers.count = async (req, res) => {
  const data = await Sala.Count();
  res.json({ data: data });
};

controllers.getSala = async (req, res) => {
  const id = req.params.id;
  const data = await Sala.findOne({
    where: {
      idsala: id
    },
  });
  res.json({ data: data });
};
controllers.editSala = async (req, res) => {
  try {
    const id = req.params.id;

    const result = await Sala.update(req.body, { where: { idsala: id } });
    res.status(200).send("1");
  } catch (error) {
    res.status(400).send(error);
  }
};
controllers.insertSala = async (req, res) => {
  try {
    await sequelize
      .sync()
      .then(() => {
        Sala.create(req.body);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
    res.status(200).send("1");
  } catch (error) {
    res.status(400).send(error);
  }
};
controllers.deleteSala = async (req, res) => {
  const id = req.params.id;
  const data = await Sala.findOne({
    where: {
      idsala: {
        [Op.eq]: id,
      },
    },
  });
  try {
    data.destroy();
    res.status(200).send("1");
  } catch {
    res.status(400).send("Err");
  }
};

module.exports = controllers;
