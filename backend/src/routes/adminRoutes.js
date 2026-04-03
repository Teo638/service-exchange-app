const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const admin = require('../middlewares/adminMiddleware');
const { getDashboardStats, getAllUsers,deleteUser,toggleAdminRole,getExtendedStats } = require('../controllers/adminController');

router.use(auth);
router.use(admin);


router.get('/stats', getDashboardStats);
router.get('/stats/extended', getExtendedStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/role', toggleAdminRole);

module.exports = router;