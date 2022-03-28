const controllers = {}
var Centro = require('../models/Centro');
var sequelize = require('../models/Database');
sequelize.sync()
controllers.test = (req, res) => {
    const data = {
        cidade: "Nuno Costa",
        endereco: '42',
        imagem: 'Viseu'
    }
    console.log("Envio de dados do Controlador centrp.");
    res.json(data);
};
controllers.testdata = async(req, res) => {
    const response = await sequelize.sync().then(function() {
            Centro.create({
                cidade: "Nuno Costa",
                endereco: '42',
                imagem: 'asdas'
            });
            Centro.create({
                cidade: "Nuno Costa2",
                endereco: '423',
                imagem: 'Viseu!'
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
    const data = await Centro.findAll();
    res.json(data)
}
module.exports = controllers;