const express = require('express');
const router = express.Router();
const { getAnalytics, getAllUsers, getAllBookings, updateUserRole, generateRevenueReport } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));
router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/bookings', getAllBookings);
router.get('/reports/revenue', generateRevenueReport);

module.exports = router;
