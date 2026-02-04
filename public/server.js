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

const BASE_URL = process.env.BASE_URL || "https://huntx.co";
const JWT_SECRET = process.env.JWT_SECRET || "huntx-2025-super-12615abc";

// ====== DATA STORAGE ======
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

// ====== CORS ======
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

app.use(express.json());

// ====== REQUEST LOGGER ======
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ====== AUTH MIDDLEWARE ======
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

// ====== API ROUTES ======
app.get("/api/config", (req, res) => {
  if (!process.env.STRIPE_PUBLISHABLE_KEY) {
    return res.status(500).json({ error: "Stripe key missing" });
  }
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing fields" });

  if (users.find(u => u.email === email))
    return res.status(400).json({ message: "User exists" });

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
    return res.status(401).json({ message: "Wrong credentials" });

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

app.get("/api/profile", authMiddleware, (req, res) => {
  const user = users.find(u => u.email === req.user.email);
  res.json({ user: { email: user.email } });
});

app.post(
  "/api/create-checkout-session",
  authMiddleware,
  async (req, res) => {
    try {
      const { items } = req.body;
      if (!items?.length)
        return res.status(400).json({ error: "Cart empty" });

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
        success_url: `${BASE_URL}/thank-you.html`,
        cancel_url: `${BASE_URL}/checkout.html`,
        metadata: { email: req.user.email }
      });

      res.json({ sessionId: session.id });
    } catch (err) {
      console.error("Stripe error:", err);
      res.status(500).json({ error: "Checkout failed" });
    }
  }
);

// ====== API FALLBACK ======
app.use("/api", (_, res) =>
  res.status(404).json({ error: "API route not found" })
);

// ====== STATIC FILES (AFTER API) ======
app.use(express.static("public"));

// ====== START SERVER ======
app.listen(PORT, () => {
  console.log(`HUNTX SERVER RUNNING → ${BASE_URL}`);
});
