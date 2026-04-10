const express = require('express');
const router = express.Router();
const { addReview, getUserReviews, markReviewsAsRead, getServiceReviews } = require('../controllers/reviewController');
const auth = require('../middlewares/authMiddleware');


router.get('/user/:userId', auth, getUserReviews);
router.get('/service/:serviceId', auth, getServiceReviews);


router.post('/', auth, addReview);
router.put('/mark-as-read', auth, markReviewsAsRead);

module.exports = router;