const express = require('express');
const router = express.Router();
const { sendMessage, getChatHistory } = require('../controllers/messageController');
const auth = require('../middlewares/authMiddleware');

router.post('/', auth, sendMessage);
router.get('/:userId', auth, getChatHistory);

module.exports = router;