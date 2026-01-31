require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || "https://huntx.co";
const JWT_SECRET = process.env.JWT_SECRET || "huntx-2025-super-12615abc";

// =====================
// MIDDLEWARE
// =====================
app.use(express.json());
app.use(express.static("public"));

app.use(cors({
  origin: [
    "https://huntx.co",
    "https://www.huntx.co",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
  ],
  credentials: true
}));

// =====================
// USER STORAGE
// =====================
const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]");

let users = JSON.parse(fs.readFileSync(USERS_FILE));
const saveUsers = () =>
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

// =====================
// AUTH MIDDLEWARE
// =====================
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// =====================
// AUTH ROUTES
// =====================
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  if (users.find(u => u.email === email))
    return res.status(400).json({ error: "User exists" });

  const hashed = await bcrypt.hash(password, 12);
  users.push({ email, password: hashed });
  saveUsers();

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, email });
});

app.get("/api/profile", authMiddleware, (req, res) => {
  res.json({ user: { email: req.user.email } });
});

// =====================
// 🔥 STRIPE CHECKOUT (FIXED)
// =====================
app.post("/api/create-checkout-session", authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !items.length)
      return res.status(400).json({ error: "Cart empty" });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: items.map(item => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : []
          },
          unit_amount: Math.round(item.price * 100)
        },
        quantity: item.quantity
      })),
      success_url: `${BASE_URL}/thank-you.html`,
      cancel_url: `${BASE_URL}/cart.html`,
      metadata: { user: req.user.email }
    });

    // ✅ THIS IS THE FIX
    res.json({ url: session.url });

  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Stripe checkout failed" });
  }
});

// =====================
app.listen(PORT, () => {
  console.log(`HUNTX running on ${BASE_URL} (port ${PORT})`);
});
