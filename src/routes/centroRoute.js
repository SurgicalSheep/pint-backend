const express = require('express');
const router = express.Router();

const centroController = require('../controllers/centroController')
router.get('/test', centroController.test);
router.get('/save', (req, res) => {
    res.json({ status: 'Centro Guardado' });
});
router.get('/testdata', centroController.testdata);
router.get('/list', centroController.list);
module.exports = router;