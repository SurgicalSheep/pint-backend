const express = require('express');
const router = express.Router();

const salaController = require('../controllers/salaController')
router.get('/list', salaController.list);
router.get('/:id', salaController.getSala);
router.post('/', salaController.insertSala);
router.delete('/:id', salaController.deleteSala);
router.put('/:id', salaController.editSala);
module.exports = router;