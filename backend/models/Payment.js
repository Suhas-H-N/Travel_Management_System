const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true }, // in paise (INR * 100)
  currency: { type: String, default: 'INR' },
  gateway: { type: String, enum: ['razorpay'], default: 'razorpay' },
  gatewayOrderId: { type: String, required: true },
  gatewayPaymentId: { type: String },
  gatewaySignature: { type: String },
  status: {
    type: String,
    enum: ['created', 'attempted', 'paid', 'failed', 'refunded'],
    default: 'created'
  },
  method: { type: String }, // card, upi, netbanking, wallet
  refundId: { type: String },
  refundAmount: { type: Number },
  refundStatus: { type: String, enum: ['pending', 'processed', 'failed'] },
  receipt: { type: String },
  notes: { type: Object },
}, { timestamps: true });

paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ userId: 1 });
paymentSchema.index({ gatewayOrderId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
