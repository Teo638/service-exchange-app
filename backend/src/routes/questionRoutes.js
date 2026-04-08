const express = require('express');
const router = express.Router();
const { askQuestion, answerQuestion, getQuestionsByService, deleteQuestion, markQuestionsAsRead, markAnswerAsRead } = require('../controllers/questionController');
const auth = require('../middlewares/authMiddleware');


router.get('/:serviceId', getQuestionsByService);


router.post('/', auth, askQuestion);
router.put('/:id/answer', auth, answerQuestion);
router.delete('/:id', auth, deleteQuestion);
router.put('/mark-as-read', auth, markQuestionsAsRead);
router.put('/mark-answer-as-read', auth, markAnswerAsRead);


module.exports = router;