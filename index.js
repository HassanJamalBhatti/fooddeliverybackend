const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
require("dotenv").config();

const Stripe = require("stripe");

// ✅ Safety check for Stripe key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ Missing STRIPE_SECRET_KEY in .env");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const foodItemsRoutes = require("./routes/FoodItems");

const app = express();

/* =========================
   CORS
========================= */
app.use(cors({
  origin: [
    "https://fooddelivery-beige.vercel.app",
    "http://localhost:3000"
  ],
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

const upload = multer({ dest: 'uploads/' });

/* =========================
   MONGODB
========================= */
mongoose.connect(
  process.env.MONGODB_URI ||
  "mongodb+srv://hassan29463855_db_user:xG1slnGNFvDuI5aC@foodco.p4ntvs9.mongodb.net/?appName=foodco"
)
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB error:", err));

/* =========================
   STRIPE - CREATE PAYMENT INTENT
========================= */
app.post("/api/create-payment-intent", async (req, res) => {
  try {
    let { amount } = req.body;

    // ✅ Validate amount
    if (!amount || isNaN(amount)) {
      return res.status(400).json({
        message: "Valid amount is required"
      });
    }

    amount = Math.round(Number(amount) * 100); // convert to cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // 🔥 IMPORTANT: always return this exact key
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    console.error("Stripe Error:", error.message);
    res.status(500).json({
      error: error.message,
    });
  }
});

/* =========================
   COD ORDER
========================= */
app.post("/api/orders/cod", async (req, res) => {
  try {
    const { orderDetails } = req.body;

    console.log("COD ORDER:", orderDetails);

    res.json({
      success: true,
      message: "COD order placed successfully",
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   PAYMENT CHECK
========================= */
app.post("/api/orders/payment-success", async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      success: paymentIntent.status === "succeeded",
      message: paymentIntent.status === "succeeded"
        ? "Payment confirmed"
        : "Payment not completed",
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================
   ROUTES
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/food-items", foodItemsRoutes);

/* ========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));