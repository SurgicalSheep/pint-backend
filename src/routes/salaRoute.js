const express = require('express');
const router = express.Router();

const salaController = require('../controllers/salaController')
router.get('/list:limit?:offset?', salaController.list);
router.get('/:id', salaController.getSala);
router.get('/:id/reservas',salaController.getSalaReservas)
router.post('/add', salaController.insertSala);
router.delete('/:id', salaController.deleteSala);
router.put('/:id', salaController.editSala);
module.exports = router;