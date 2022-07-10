const express = require('express');
const router = express.Router();
const {verifyAccessToken, isAdmin} = require("../middlewares/jwt")

const empregadoLimpezaController = require('../controllers/empregadoLimpezaController')
router.get('/list',verifyAccessToken, empregadoLimpezaController.list);
router.get('/:id',verifyAccessToken, empregadoLimpezaController.getEmpregadoLimpeza);
router.post('/add',verifyAccessToken,empregadoLimpezaController.insertEmpregadoLimpeza);
router.delete('/:id',verifyAccessToken, empregadoLimpezaController.deleteEmpregadoLimpeza);
router.put('/:id',verifyAccessToken, empregadoLimpezaController.editEmpregadoLimpeza);
module.exports = router;