const express = require('express');
const router = express.Router();

const feedbackController = require('../controllers/feedbackController')
router.get('/list', feedbackController.list);
router.get('/:id', feedbackController.getFeedback);
router.post('/add', feedbackController.insertFeedback);
router.delete('/:id', feedbackController.deleteFeedack);
router.put('/:id', feedbackController.editFeedback);
module.exports = router;