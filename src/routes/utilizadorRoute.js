const express = require('express');
const router = express.Router();

const utilizadorController = require('../controllers/utilizadorController')
router.get('/list', utilizadorController.list);
router.get('/:id', utilizadorController.getUtilizador);
router.post('/add', utilizadorController.insertUtilizador);
router.delete('/:id', utilizadorController.deleteUtilizador);
router.put('/:id', utilizadorController.editUtilizador);
router.post('/bulkAdd', utilizadorController.bulkInsertUtilizador);
module.exports = router;