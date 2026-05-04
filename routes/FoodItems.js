const express = require('express');
const router = express.Router();
const multer = require('multer');
const FoodItem = require('../models/FoodItems');

const upload = multer({ dest: 'uploads/' }); // This saves uploaded files to the 'uploads' directory

router.get('/', async (req, res) => {
  try {
    const foodItems = await FoodItem.find();
    res.json(foodItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post('/', upload.single('image'), async (req, res) => {
  const { name, description, price } = req.body;
  const image = req.file ? req.file.path : null;

  const newFoodItem = new FoodItem({
    name,
    description,
    price,
    image,
  });

  try {
    await newFoodItem.save();
    res.status(201).json({ message: 'Food item created successfully!' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
