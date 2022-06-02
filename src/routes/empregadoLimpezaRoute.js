const express = require('express');
const router = express.Router();

const empregadoLimpezaController = require('../controllers/empregadoLimpezaController')
router.get('/list', empregadoLimpezaController.list);
router.get('/:id', empregadoLimpezaController.getEmpregadoLimpeza);
router.post('/add',empregadoLimpezaController.insertEmpregadoLimpeza);
router.delete('/:id', empregadoLimpezaController.deleteEmpregadoLimpeza);
router.put('/:id', empregadoLimpezaController.editEmpregadoLimpeza);
module.exports = router;