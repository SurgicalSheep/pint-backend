const express = require('express');
const router = express.Router();

const pedidoController = require('../controllers/pedidoController')
router.get('/list', pedidoController.list);
router.get('/:id', pedidoController.getPedido);
router.post('/add', pedidoController.insertPedido);
router.delete('/:id', pedidoController.deletePedido);
router.put('/:id', pedidoController.editPedido);
module.exports = router;