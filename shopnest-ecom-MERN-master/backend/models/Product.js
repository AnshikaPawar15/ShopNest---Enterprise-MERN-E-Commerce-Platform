const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  brand: { type: String, required: true, default: 'Generic' },
  stock: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  ratings: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  tags: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
