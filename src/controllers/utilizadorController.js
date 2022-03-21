const controllers = {}
var Utilizador = require('../models/Utilizador');
var sequelize = require('../models/Database');
sequelize.sync()
controllers.test = (req, res) => {
    const data = {
        name: "Nuno Costa",
        age: 42,
        city: 'Viseu'
    }
    console.log("Envio de dados do Controlador utilizador.");
    res.json(data);
};
controllers.testdata = async(req, res) => {
    const response = await sequelize.sync().then(function() {
            // APAGAR após a primeira EXECUÇÃO
            // Cria Utilizador
            Utilizador.create({
                nome: 'Nuno Costa',
                datanascimento: '2000-01-03',
                telemovel: '232480533',
                email: 'adios@estgv.ipv.pt',
                password: '123123'
            });
            Utilizador.create({
                nome: 'André Pina',
                datanascimento: '1999-05-16',
                telemovel: '232392813',
                email: 'hello@estgv.ipv.pt',
                password: '123123'
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
    const data = await Utilizador.findAll();
    res.json(data)
}
module.exports = controllers;