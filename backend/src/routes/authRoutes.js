const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { registerUser, loginUser,googleLogin, getNotifications,handleRefreshToken,logoutUser } = require('../controllers/authController');



router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/notifications', auth, getNotifications);
router.post('/refresh', handleRefreshToken);
router.post('/logout', logoutUser);

module.exports = router;