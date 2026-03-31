const express = require('express');
const router = express.Router();
const { sendRequest, getMySentRequests, getReceivedRequests, updateRequestStatus, markRequestsAsRead } = require('../controllers/requestController');
const auth = require('../middlewares/authMiddleware');


router.post('/', auth, sendRequest);
router.get('/sent', auth, getMySentRequests);
router.get('/received', auth, getReceivedRequests);
router.put('/:id/status', auth, updateRequestStatus);
router.put('/mark-as-read', auth, markRequestsAsRead);

module.exports = router;