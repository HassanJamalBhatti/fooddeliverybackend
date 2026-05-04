const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();

const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const foodItemsRoutes = require("./routes/FoodItems");

const app = express();

// 🔥 CORS
app.use(cors({
  origin: [
    "https://fooddelivery-beige.vercel.app",
    "http://localhost:3000"
  ],
  credentials: true
}));

// 🔥 JSON middleware
app.use(express.json());

// 🔥 Static uploads
app.use('/uploads', express.static('uploads'));

// 🔥 Multer
const upload = multer({ dest: 'uploads/' });

// 🔥 MongoDB
mongoose.connect(process.env.MONGODB_URI || "https://cloud.mongodb.com/v2/69f864dc92178d2d468598d9/foodhut")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

/* =========================
   🔥 STRIPE PAYMENT ROUTES
========================= */

/**
 * Create Payment Intent (Card + Google Pay)
 */
app.post("/api/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      automatic_payment_methods: {
        enabled: true, // enables Card + Google Pay (Google Pay)
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * COD ORDER API
 */
app.post("/api/orders/cod", async (req, res) => {
  try {
    const { orderDetails } = req.body;

    console.log("COD ORDER:", orderDetails);

    // TODO: save in MongoDB if needed

    res.json({
      success: true,
      message: "COD order placed successfully",
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PAYMENT SUCCESS CHECK (optional)
 */
app.post("/api/orders/payment-success", async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      return res.json({
        success: true,
        message: "Payment confirmed",
      });
    }

    res.json({
      success: false,
      message: "Payment not completed",
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   🔥 EXISTING ROUTES
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/food-items", foodItemsRoutes);

/* ========================= */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));