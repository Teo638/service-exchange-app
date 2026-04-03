const express = require('express');
const router = express.Router();
const { askQuestion, answerQuestion, getQuestionsByService,deleteQuestion } = require('../controllers/questionController');
const auth = require('../middlewares/authMiddleware');


router.get('/:serviceId', getQuestionsByService);


router.post('/', auth, askQuestion);
router.put('/:id/answer', auth, answerQuestion);
router.delete('/:id', auth, deleteQuestion);


module.exports = router;