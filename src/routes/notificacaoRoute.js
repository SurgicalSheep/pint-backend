const express = require('express');
const router = express.Router();

const notificacaoController = require('../controllers/notificacaoController')
router.get('/list', notificacaoController.list);
router.get('/allUtilizadores', notificacaoController.getNotificacoesUtilizador);
router.get('/:id', notificacaoController.getNotificacao);
router.post('/', notificacaoController.insertNotificacao);
router.delete('/:id', notificacaoController.deleteNotificacao);
module.exports = router;