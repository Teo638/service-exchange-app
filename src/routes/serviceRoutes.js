const express = require('express');
const router = express.Router();
const { createService, getAllServices } = require('../controllers/serviceController');
const auth = require('../middlewares/authMiddleware');


router.get('/', getAllServices);


router.post('/', auth, createService);

module.exports = router;