const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const auth = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { registerUser, loginUser, googleLogin, handleRefreshToken, logoutUser, updateProfile, getUserPublicProfile, deleteMyAccount } = require('../controllers/authController');


const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Previše pokušaja. Molimo pokušajte za 15 minuta." }
});

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/google', googleLogin);
router.post('/refresh', authLimiter, handleRefreshToken);
router.post('/logout', logoutUser);
router.put('/profile', auth, upload.single('avatar'), updateProfile);
router.get('/user/:id', getUserPublicProfile);

router.delete('/account', auth, deleteMyAccount);

module.exports = router;