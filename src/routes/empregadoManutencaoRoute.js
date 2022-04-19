const express = require('express');
const router = express.Router();

const EmpregadoManutencaoController = require('../controllers/empregadoManutencaoController')
router.get('/list', EmpregadoManutencaoController.list);
router.get('/EmpregadoLimpezaCentro/list', EmpregadoManutencaoController.getEmpregadosManutencaoCentro);
router.get('/EmpregadoLimpezaCentro/:id', EmpregadoManutencaoController.getEmpregadoManutencaoCentro);
router.get('/:id', EmpregadoManutencaoController.getEmpregadoManutencao);
router.post('/add',EmpregadoManutencaoController.insertEmpregadoManutencao);
router.delete('/:id', EmpregadoManutencaoController.deleteEmpregadoManutencao);
router.put('/:id', EmpregadoManutencaoController.editEmpregadoManutencao);
module.exports = router;