const express = require('express');
const router = express.Router();
const {verifyAccessToken, isAdmin} = require("../middlewares/jwt")

const pedidoController = require('../controllers/pedidoController')
router.get('/list',verifyAccessToken, pedidoController.list);
router.get('/tempoLimpeza', pedidoController.getTempoLimpeza);
router.get('/getPedidosEstado', pedidoController.getPedidoEstado);
router.get('/:id',verifyAccessToken, pedidoController.getPedido);
router.post('/add',verifyAccessToken, pedidoController.insertPedido);
router.post('/updateTempoLimpeza',verifyAccessToken,isAdmin, pedidoController.editTempoLimpeza);
router.delete('/:id',verifyAccessToken, pedidoController.deletePedido);
router.put('/:id',verifyAccessToken, pedidoController.editPedido);
module.exports = router;