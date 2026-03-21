const express = require('express');
const router = express.Router();
const { addReview, getUserReviews } = require('../controllers/reviewController');
const auth = require('../middlewares/authMiddleware');


router.get('/user/:userId', getUserReviews);


router.post('/', auth, addReview);

module.exports = router;