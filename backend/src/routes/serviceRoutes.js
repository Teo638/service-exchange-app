const express = require('express');
const router = express.Router();
const { createService, getAllServices, getServiceById, updateService, deleteService } = require('../controllers/serviceController');
const auth = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { validateService } = require('../middlewares/validationMiddleware');


router.get('/', getAllServices);
router.get('/:id', getServiceById);



router.post('/', auth, upload.single('image'), validateService, createService);
router.put('/:id', auth, upload.single('image'), validateService, updateService);
router.delete('/:id', auth, deleteService);

module.exports = router;