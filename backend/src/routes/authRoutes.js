const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { registerUser, loginUser,googleLogin, getNotifications,handleRefreshToken,logoutUser, updateProfile, deleteMyAccount } = require('../controllers/authController');




router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/notifications', auth, getNotifications);
router.post('/refresh', handleRefreshToken);
router.post('/logout', logoutUser);
router.put('/profile', auth, upload.single('avatar'), updateProfile);

router.delete('/account', auth, deleteMyAccount);

module.exports = router;