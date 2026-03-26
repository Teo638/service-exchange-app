const express = require('express');
const router = express.Router();
const { sendMessage, getChatHistory, getContacts, markAsRead } = require('../controllers/messageController');
const auth = require('../middlewares/authMiddleware');

router.post('/', auth, sendMessage);
router.get('/contacts', auth, getContacts);
router.get('/:userId', auth, getChatHistory);
router.put('/read/:senderId', auth, markAsRead);

module.exports = router;