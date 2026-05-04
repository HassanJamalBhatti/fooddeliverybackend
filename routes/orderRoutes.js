const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Fetch all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Confirm  order
router.put('/:id/confirm', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    order.status = 'Confirmed';
    await order.save();
    res.status(200).json({ message: 'Order confirmed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject  order
router.put('/:id/reject', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    order.status = 'Rejected';
    await order.save();
    res.status(200).json({ message: 'Order rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
