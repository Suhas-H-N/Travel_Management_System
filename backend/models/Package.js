const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  destinations: [{ city: String, country: String, nights: Number }],
  duration: { type: Number, required: true }, // total nights
  inclusions: [{ type: String }], // Flights, Hotels, Meals, Transfers, etc.
  exclusions: [{ type: String }],
  itinerary: [{
    day: Number,
    title: String,
    description: String,
    activities: [String],
  }],
  priceTiers: {
    standard: { type: Number, required: true },
    deluxe: { type: Number },
    premium: { type: Number },
  },
  availableDates: [{ startDate: Date, endDate: Date, spotsLeft: Number }],
  maxGroupSize: { type: Number, default: 20 },
  minAge: { type: Number, default: 0 },
  images: [{ type: String }],
  category: { type: String, enum: ['beach', 'adventure', 'heritage', 'honeymoon', 'family', 'hill', 'international'], required: true },
  tags: [{ type: String }],
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  bookingCount: { type: Number, default: 0 },
}, { timestamps: true });

packageSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

packageSchema.index({ category: 1, isActive: 1 });
packageSchema.index({ isFeatured: -1, bookingCount: -1 });

module.exports = mongoose.model('Package', packageSchema);
