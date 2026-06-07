const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomType: { type: String, enum: ['standard', 'deluxe', 'suite', 'family'], required: true },
  roomNumber: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
  maxGuests: { type: Number, default: 2 },
  amenities: [{ type: String }],
  images: [{ type: String }],
  status: { type: String, enum: ['available', 'booked', 'maintenance'], default: 'available' },
}, { _id: true });

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    country: { type: String, default: 'India' },
    pincode: { type: String },
  },
  starRating: { type: Number, min: 1, max: 5, required: true },
  rooms: [roomSchema],
  amenities: [{ type: String }], // Pool, Gym, WiFi, Restaurant, etc.
  images: [{ type: String }],
  checkInTime: { type: String, default: '14:00' },
  checkOutTime: { type: String, default: '12:00' },
  policies: {
    petAllowed: { type: Boolean, default: false },
    smokingAllowed: { type: Boolean, default: false },
    freeCancellationHours: { type: Number, default: 24 },
  },
  contactEmail: { type: String },
  contactPhone: { type: String },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

hotelSchema.index({ 'location': '2dsphere' });
hotelSchema.index({ 'location.city': 1, starRating: -1 });

module.exports = mongoose.model('Hotel', hotelSchema);
