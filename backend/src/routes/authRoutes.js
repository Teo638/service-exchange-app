const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { registerUser, loginUser,googleLogin, getNotifications } = require('../controllers/authController');



router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/notifications', auth, getNotifications);

module.exports = router;