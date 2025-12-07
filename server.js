// server.js → FINAL FIXED VERSION (LOGIN WORKS EVERYWHERE)
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const JWT_SECRET = process.env.JWT_SECRET || "huntx-2025-super-secret-change-this";

const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

let users = [];
if (fs.existsSync(USERS_FILE)) {
  try { users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8")); }
  catch (e) { console.log("users.json corrupted → starting fresh"); }
}

const saveUsers = () => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

// ←←← REPLACE YOUR ENTIRE CORS BLOCK WITH THIS ↓↓↓
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow your live domain + localhost for testing
    const allowedOrigins = [
      "https://dropxpress.co",
      "http://localhost:3000",
      "http://127.0.0.1:3000"
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.static("public"));

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")?.[1];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

app.get("/api/config", (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Missing fields" });
  if (users.find(u => u.email === email)) return res.status(400).json({ message: "User exists" });

  const hashed = await bcrypt.hash(password, 12);
  users.push({ email, password: hashed, createdAt: new Date().toISOString() });
  saveUsers();

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ message: "Registered", token });
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Wrong credentials" });
  }
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ message: "Logged in", token, email });
});

app.get("/api/profile", authMiddleware, (req, res) => {
  const user = users.find(u => u.email === req.user.email);
  const { password, ...safe } = user || {};
  res.json({ user: safe });
});

app.post("/api/create-checkout-session", authMiddleware, async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Cart empty" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: items.map(i => ({
        price_data: {
          currency: "usd",
          product_data: { name: `${i.name} - ${i.brand || ""}`.trim(), images: i.image ? [i.image] : [] },
          unit_amount: Math.round(i.price * 100),
        },
        quantity: i.quantity,
      })),
      success_url: `${BASE_URL}/thank-you.html`,
      cancel_url: `${BASE_URL}/checkout.html`,
      metadata: { user_email: req.user.email },
    });
    res.json({ sessionId: session.id });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: "Checkout failed" });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`\nHUNTX SERVER RUNNING → http://localhost:${PORT}`);
  console.log(`Open: http://localhost:${PORT}\n`);
});