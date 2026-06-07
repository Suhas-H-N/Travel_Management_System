const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const passengerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  seatNumber: { type: String },
  mealPreference: { type: String, enum: ['veg', 'non-veg', 'vegan', 'any'], default: 'any' },
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  bookingRef: { type: String, unique: true, default: () => `TMS-${Date.now()}-${Math.floor(Math.random() * 1000)}` },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingType: { type: String, enum: ['flight', 'train', 'bus', 'hotel', 'package'], required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'bookingTypeRef' },
  bookingTypeRef: {
    type: String,
    enum: ['Transport', 'Hotel', 'Package'],
    required: true,
  },
  passengers: [passengerSchema],
  rooms: [{
    roomType: String,
    roomNumber: String,
    guests: Number,
  }],
  travelDate: { type: Date, required: true },
  returnDate: { type: Date },
  totalAmount: { type: Number, required: true },
  baseFare: { type: Number },
  taxes: { type: Number },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'],
    default: 'pending'
  },
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  cancellationReason: { type: String },
  cancellationDate: { type: Date },
  refundAmount: { type: Number },
  eTicketUrl: { type: String },
  cancellationPolicy: {
    freeCancellationBefore: Date,
    penaltyPercentage: { type: Number, default: 25 },
  },
  holdExpiresAt: { type: Date },
}, { timestamps: true });

// Index for fast user booking lookups
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ bookingRef: 1 });
bookingSchema.index({ createdAt: -1 });
// TTL index to auto-delete expired pending bookings after 15 mins
bookingSchema.index({ holdExpiresAt: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { status: 'pending' } });

module.exports = mongoose.model('Booking', bookingSchema);
