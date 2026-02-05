// server.js (updated - minor fixes for consistency and error handling)

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

const BASE_URL =
  process.env.BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://huntx.co"
    : "http://localhost:3000"); // Updated to use huntx.co as base

console.log("NODE_ENV:", process.env.NODE_ENV); // Debug log
console.log("BASE_URL set to:", BASE_URL); // Debug log

const JWT_SECRET = process.env.JWT_SECRET || "huntx-2025-super-12615abc";

// ======================================================
// DATA STORAGE
// ======================================================
const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

let users = [];
if (fs.existsSync(USERS_FILE)) {
  try {
    users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
  } catch {
    console.log("users.json corrupted → starting fresh");
  }
}

const saveUsers = () =>
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

// ======================================================
// MIDDLEWARE
// ======================================================
app.use(cors({
  origin: [
    "https://drop-xpress.onrender.com",
    "https://www.drop-xpress.onrender.com",
    "https://huntx.co",
    "https://www.huntx.co",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "1mb" }));

// AUTH MIDDLEWARE
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

// ======================================================
// API ROUTES
// ======================================================
app.get("/api/config", (_, res) =>
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY })
);

app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing credentials" });

  if (users.find(u => u.email === email))
    return res.status(400).json({ error: "Email taken" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    users.push({ email, password: hashed });
    saveUsers();

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing credentials" });

  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  try {
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/api/profile", authMiddleware, (req, res) => {
  const user = users.find(u => u.email === req.user.email);
  res.json({ user: { email: user.email } });
});

app.post("/api/create-checkout-session", authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;
    if (!items?.length)
      return res.status(400).json({ error: "Cart empty" });

    const successUrl = `${BASE_URL}/thank-you.html`;
    const cancelUrl = `${BASE_URL}/cart.html`;

    console.log("Creating session with:"); // Debug log
    console.log("  success_url:", successUrl);
    console.log("  cancel_url:", cancelUrl);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: items.map(i => ({
        price_data: {
          currency: "usd",
          product_data: { name: i.name },
          unit_amount: Math.round(i.price * 100)
        },
        quantity: i.quantity
      })),
      success_url: successUrl,
      cancel_url: cancelUrl, // Updated cancel to cart.html for better UX
      metadata: { email: req.user.email }
    });

    res.json({ sessionId: session.id });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Checkout failed" });
  }
});

// ======================================================
// API FALLBACK
// ======================================================
app.use("/api", (_, res) =>
  res.status(404).json({ error: "API route not found" })
);

// ======================================================
// STATIC FILES + SPA FALLBACK
// ======================================================
app.use(express.static("public"));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// ======================================================
// START SERVER
// ======================================================
app.listen(PORT, () => {
  console.log(`HUNTX SERVER RUNNING → ${BASE_URL}`);
});