const express = require('express');
const router = express.Router();

const utilizadorController = require('../controllers/utilizadorController')
router.get('/test', utilizadorController.test);
router.get('/save', (req, res) => {
    res.json({ status: 'Utilizador Guardado' });
});
router.get('/testdata', utilizadorController.testdata);
router.get('/list', utilizadorController.list);
module.exports = router;