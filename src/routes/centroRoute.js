const express = require('express');
const router = express.Router();

const centroController = require('../controllers/centroController')
router.get('/list', centroController.list);
router.get('/allUtilizadores', centroController.getUtilizadorCentro);
router.get('/:id/salas', centroController.getSalasCentro);
router.get('/:id', centroController.getCentro);
router.post('/', centroController.insertCentro);
router.delete('/:id', centroController.deleteCentro);
router.put('/:id', centroController.editCentro);
module.exports = router;