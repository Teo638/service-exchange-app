const express = require('express');
const router = express.Router();
const { addReview, getUserReviews, markReviewsAsRead } = require('../controllers/reviewController');
const auth = require('../middlewares/authMiddleware');


router.get('/user/:userId', auth, getUserReviews);


router.post('/', auth, addReview);
router.put('/mark-as-read', auth, markReviewsAsRead);

module.exports = router;