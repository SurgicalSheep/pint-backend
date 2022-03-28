const controllers = {}
var Sala = require('../models/Sala');
var sequelize = require('../models/Database');
sequelize.sync()
controllers.test = (req, res) => {
    const data = {
        idcentro: 1,
        lotacaomax: 30
    }
    console.log("Envio de dados do Controlador sala.");
    res.json(data);
};
controllers.testdata = async(req, res) => {
    const response = await sequelize.sync().then(function() {
        Sala.create({
                idcentro: 1,
                lotacaomax: 30
            });
            Sala.create({
                idcentro: 1,
                lotacaomax: 25
            });
            Sala.create({
                idcentro: 2,
                lotacaomax: 35
            });

            const data = Utilizador.findAll()
            return data;
        })
        .catch(err => {
            return err;
        });
    res.json(response)
}
controllers.list = async(req, res) => {
    const data = await Sala.findAll();
    res.json(data)
}
module.exports = controllers;