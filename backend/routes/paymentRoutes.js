// paymentRoutes.js
const express = require('express');
const router = express.Router();
const { initiatePayment, verifyPayment, getPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/initiate', initiatePayment);
router.post('/verify', verifyPayment);
router.get('/:id', getPayment);

module.exports = router;
