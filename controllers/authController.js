const bcrypt = require("bcrypt");
const User = require("../models/User");


const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
  
      // Create a new user
      const newUser = new User({ name, email, password });
      await newUser.save();
      res.status(201).json({ name: newUser.name });
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  


const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    
    res.status(200).json({ name: user.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { registerUser, loginUser };
