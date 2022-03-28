const express = require('express');
const router = express.Router();

const salaController = require('../controllers/salaController')
router.get('/test', salaController.test);
router.get('/save', (req, res) => {
    res.json({ status: 'Sala Guardada' });
});
router.get('/testdata', salaController.testdata);
router.get('/list', salaController.list);
module.exports = router;