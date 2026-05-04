// models/Order.js

const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  paymentMethod: { type: String, required: true },
  cardNumber: { type: String },
  expiryDate: { type: String },
  cvv: { type: String },
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  userInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true }
  }
});

module.exports = mongoose.model('Order', OrderSchema);
