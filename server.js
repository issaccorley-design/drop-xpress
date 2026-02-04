import express from "express";
import cors from "cors";
import path from "path";
import jwt from "jsonwebtoken";
import Stripe from "stripe";

const app = express();
const PORT = process.env.PORT || 10000;
const __dirname = path.resolve();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ===============================
// MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// AUTH MIDDLEWARE
// ===============================
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token" });

  try {
    const token = header.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// ===============================
// API ROUTES (🔥 MUST BE FIRST)
// ===============================

// Stripe config
app.get("/api/config", (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// Login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing fields" });

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

// Register
app.post("/api/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing fields" });

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

// Profile
app.get("/api/profile", auth, (req, res) => {
  res.json({ user: { email: req.user.email } });
});

// Stripe Checkout
app.post("/api/create-checkout-session", auth, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: req.body.items.map(i => ({
        price_data: {
          currency: "usd",
          product_data: { name: i.name, images: [i.image] },
          unit_amount: Math.round(i.price * 100)
        },
        quantity: i.quantity
      })),
      success_url: `${process.env.FRONTEND_URL}/success.html`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout.html`
    });

    res.json({ sessionId: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// FRONTEND (🔥 MUST BE LAST)
// ===============================
app.use(express.static("public"));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// ===============================
app.listen(PORT, () =>
  console.log("🚀 Server running on port", PORT)
);
