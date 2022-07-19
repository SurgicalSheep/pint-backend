const express = require('express');
const router = express.Router();
const {verifyAccessToken, isAdmin} = require("../middlewares/jwt")

const reservaController = require('../controllers/reservaController')
router.get('/list',verifyAccessToken, reservaController.list);
router.get('/search',verifyAccessToken, reservaController.searchReservas);
router.get('/range',verifyAccessToken,reservaController.rangeReservas)
router.get('/daysReserva',verifyAccessToken,reservaController.daysWithReserva)
router.get('/reservasDecorrer',verifyAccessToken,reservaController.reservasDecorrer)
router.get('/stat',reservaController.stat)
router.get('/rangeReservasBySala',reservaController.rangeReservasBySala)
router.get('/freeSalas',verifyAccessToken,reservaController.freeSalas)
router.get('/:id',verifyAccessToken, reservaController.getReserva);
router.post('/add',verifyAccessToken, reservaController.insertReserva);
router.delete('/:id',verifyAccessToken, reservaController.deleteReserva);
router.put('/:id',verifyAccessToken, reservaController.editReserva);
module.exports = router;