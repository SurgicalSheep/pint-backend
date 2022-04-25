const express = require('express');
const router = express.Router();

const notificacaoController = require('../controllers/notificacaoController')
router.get('/list', notificacaoController.list);
router.get('/utilizador/:id', notificacaoController.getNotificacoesUtilizador);
router.get('/:id', notificacaoController.getNotificacao);
router.post('/add/utilizador', notificacaoController.insertUtilizadorNotificacao);
router.post('/add', notificacaoController.insertNotificacao);
router.delete('/:id', notificacaoController.deleteNotificacao);
module.exports = router;