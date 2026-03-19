const express = require('express');
const router = express.Router();
const { createService, getAllServices, getServiceById, updateService, deleteService } = require('../controllers/serviceController');
const auth = require('../middlewares/authMiddleware');


router.get('/', getAllServices);
router.get('/:id', getServiceById);


router.post('/', auth, createService);
router.put('/:id', auth, updateService);
router.delete('/:id', auth, deleteService);

module.exports = router;