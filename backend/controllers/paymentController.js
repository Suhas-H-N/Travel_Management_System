const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { confirmBooking } = require('./bookingController');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc  Initiate payment - create Razorpay order
// @route POST /api/payments/initiate
exports.initiatePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Booking is not in pending state' });
    }

    const receipt = `tms_${bookingId}_${Date.now()}`;
    const order = await razorpay.orders.create({
      amount: Math.round(booking.totalAmount * 100), // paise
      currency: 'INR',
      receipt,
      notes: { bookingId: bookingId.toString(), userId: req.user._id.toString() }
    });

    const payment = await Payment.create({
      bookingId,
      userId: req.user._id,
      amount: order.amount,
      currency: order.currency,
      gatewayOrderId: order.id,
      receipt,
      status: 'created',
    });

    await Booking.findByIdAndUpdate(bookingId, { paymentId: payment._id });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      paymentId: payment._id,
      bookingRef: booking.bookingRef,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Verify payment signature and confirm booking
// @route POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Fetch payment details from Razorpay
    const rpPayment = await razorpay.payments.fetch(razorpay_payment_id);

    await Payment.findOneAndUpdate(
      { gatewayOrderId: razorpay_order_id },
      {
        gatewayPaymentId: razorpay_payment_id,
        gatewaySignature: razorpay_signature,
        status: 'paid',
        method: rpPayment.method,
      }
    );

    // Confirm booking and generate e-ticket
    const booking = await confirmBooking(bookingId);

    res.json({ success: true, message: 'Payment verified', booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get payment details
// @route GET /api/payments/:id
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('bookingId');
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
