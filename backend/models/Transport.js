const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true },
  class: { type: String, enum: ['economy', 'business', 'first', 'sleeper', 'ac', 'general'], default: 'economy' },
  status: { type: String, enum: ['available', 'booked', 'blocked'], default: 'available' },
  price: { type: Number, required: true },
}, { _id: false });

const transportSchema = new mongoose.Schema({
  type: { type: String, enum: ['flight', 'train', 'bus'], required: true },
  carrier: { type: String, required: true }, // IndiGo, IRCTC, RedBus, etc.
  transportNumber: { type: String, required: true }, // 6E-234, 12951, etc.
  origin: { type: String, required: true, uppercase: true },
  originCity: { type: String, required: true },
  destination: { type: String, required: true, uppercase: true },
  destinationCity: { type: String, required: true },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  duration: { type: Number }, // in minutes, computed
  seats: [seatSchema],
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number },
  priceClasses: {
    economy: { type: Number },
    business: { type: Number },
    first: { type: Number },
    sleeper: { type: Number },
    ac: { type: Number },
    general: { type: Number },
  },
  amenities: [{ type: String }], // WiFi, Meals, Charging, etc.
  stops: [{ city: String, arrivalTime: Date, departureTime: Date }],
  status: { type: String, enum: ['scheduled', 'delayed', 'cancelled', 'completed'], default: 'scheduled' },
  images: [{ type: String }],
}, { timestamps: true });

transportSchema.index({ origin: 1, destination: 1, departureTime: 1 });
transportSchema.index({ type: 1 });

// Auto-compute duration
transportSchema.pre('save', function (next) {
  if (this.departureTime && this.arrivalTime) {
    this.duration = Math.round((this.arrivalTime - this.departureTime) / 60000);
  }
  if (this.seats) {
    this.availableSeats = this.seats.filter(s => s.status === 'available').length;
  }
  next();
});

module.exports = mongoose.model('Transport', transportSchema);
