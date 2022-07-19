const express = require('express');
const router = express.Router();
const {verifyAccessToken, isAdmin} = require("../middlewares/jwt")

const salaController = require('../controllers/salaController')
router.get('/list', salaController.list);
router.get('/:id',verifyAccessToken, salaController.getSala);
router.get('/:id/reservas',verifyAccessToken,salaController.getSalaReservas)
router.post('/add',verifyAccessToken, isAdmin, salaController.insertSala);
router.delete('/:id',verifyAccessToken, isAdmin, salaController.deleteSala);
router.put('/:id',verifyAccessToken, isAdmin, salaController.editSala);
module.exports = router;