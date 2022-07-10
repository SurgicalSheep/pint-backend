const express = require('express');
const router = express.Router();
const {verifyAccessToken, isAdmin} = require("../middlewares/jwt")

const feedbackController = require('../controllers/feedbackController')
router.get('/list',verifyAccessToken, feedbackController.list);
router.get('/:id',verifyAccessToken, feedbackController.getFeedback);
router.post('/add',verifyAccessToken, feedbackController.insertFeedback);
router.delete('/:id',verifyAccessToken, feedbackController.deleteFeedack);
router.put('/:id',verifyAccessToken, feedbackController.editFeedback);
module.exports = router;