const express = require('express');
const router = express.Router();

const equipamentoController = require('../controllers/equipamentoController')
router.get('/list', equipamentoController.list);
router.get('/equipamentoSala/list', equipamentoController.getEquipamentosSalas);
router.get('/:id', equipamentoController.getEquipamento);
router.post('/add', equipamentoController.insertEquipamento);
router.delete('/:id', equipamentoController.deleteEquipamento);
router.put('/:id', equipamentoController.editEquipamento);
module.exports = router;