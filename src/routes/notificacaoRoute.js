const express = require('express');
const router = express.Router();
const {verifyAccessToken, isAdmin} = require("../middlewares/jwt")

const notificacaoController = require('../controllers/notificacaoController')
router.get('/list',verifyAccessToken, notificacaoController.list);
router.get('/utilizador/:id',verifyAccessToken, notificacaoController.getNotificacoesUtilizador);
router.get('/top10',verifyAccessToken, notificacaoController.getTop10Notificacao);
router.get('/:id',verifyAccessToken, notificacaoController.getNotificacao);
router.post('/add/utilizador',verifyAccessToken, notificacaoController.insertUtilizadorNotificacao);
router.post('/add',verifyAccessToken, notificacaoController.insertNotificacao);
router.put('/:id',verifyAccessToken, notificacaoController.editNotificacao);
router.delete('/:id',verifyAccessToken, notificacaoController.deleteNotificacao);
module.exports = router;