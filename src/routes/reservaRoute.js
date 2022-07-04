const express = require('express');
const router = express.Router();

const reservaController = require('../controllers/reservaController')
router.get('/list', reservaController.list);
router.get('/search', reservaController.searchReservas);
router.get('/range',reservaController.rangeReservas)
router.get('/:id', reservaController.getReserva);
router.post('/add', reservaController.insertReserva);
router.delete('/:id', reservaController.deleteReserva);
router.put('/:id', reservaController.editReserva);
module.exports = router;