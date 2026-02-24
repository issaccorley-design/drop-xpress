// script.js
// Consolidated & fixed version – handles auth, cart, loadout, checkout, user nav, etc.
// Removed duplicates, fixed token issues, added missing functions

// ────────────────────────────────────────────────
// CONFIG & CONSTANTS
// ────────────────────────────────────────────────
const API_BASE = location.hostname === "localhost"
  ? "http://localhost:10000"
  : "https://drop-xpress.onrender.com";  // ← your production backend

let stripePromise = null;
(async () => {
  try {
    const res = await fetch(`${API_BASE}/api/config`);
    if (!res.ok) throw new Error("Config fetch failed");
    const { publishableKey } = await res.json();
    if (!publishableKey) throw new Error("Missing Stripe key");
    stripePromise = Stripe(publishableKey);
  } catch (err) {
    console.error("Stripe init failed:", err);
  }
})();

// ────────────────────────────────────────────────
// LOCALSTORAGE HELPERS
// ────────────────────────────────────────────────
function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("huntx_user") || "null");
  } catch {
    return null;
  }
}

function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("huntx_user");
  localStorage.removeItem("cart"); // optional: clear cart on logout
  location.reload();
}

// ────────────────────────────────────────────────
// CART & COUNT UPDATES
// ────────────────────────────────────────────────
function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + (item.quantity || 1), 0);
  document.querySelectorAll("#cart-count").forEach(el => {
    el.textContent = count;
  });
}

function calculateItemPrice(item) {
  return item.salePrice && item.salePrice < item.price ? item.salePrice : item.price;
}

// ────────────────────────────────────────────────
// ADD / REMOVE FROM CART
// ────────────────────────────────────────────────
function addToCart(id) {
  const token = getToken();
  if (!token) {
    alert("Please log in to add items to your loadout.");
    location.href = "login.html";
    return;
  }

  const product = products.find(p => p.id === id);
  if (!product) return;

  let cart = getCart();
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  updateCartCount();
  updateFloatingCart(); // if floating cart exists on page

  // Visual feedback on button
  const btn = event?.target;
  if (btn) {
    const originalText = btn.textContent;
    btn.textContent = "ADDED!";
    btn.classList.add("added");
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove("added");
    }, 1200);
  }
}

function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== id);
  saveCart(cart);
  updateCartCount();
  updateFloatingCart();
  renderCart(); // if on cart.html
}

// ────────────────────────────────────────────────
// FLOATING CART (shop.html / others)
// ────────────────────────────────────────────────
function updateFloatingCart() {
  const cartEl = document.getElementById("floating-cart");
  if (!cartEl) return;

  const cart = getCart();
  const itemsEl = document.getElementById("floating-items");
  const totalEl = document.querySelector(".floating-total");

  if (cart.length === 0) {
    cartEl.classList.remove("show");
    cartEl.classList.add("minimized");
    return;
  }

  if (itemsEl) {
    itemsEl.innerHTML = cart.slice(0, 4).map(item => `
      <div class="floating-item">
        <img src="${item.images?.[0] || 'placeholder.jpg'}" alt="${item.name}">
        <div class="info">
          <div style="font-weight:700;">${item.name}</div>
          <div style="color:#ff6b00;">$${calculateItemPrice(item)} × ${item.quantity}</div>
        </div>
        <button class="remove-btn" onclick="removeFromCart(${item.id})">×</button>
      </div>
    `).join("");

    if (cart.length > 4) {
      itemsEl.innerHTML += `<div style="text-align:center;padding:1rem;color:#aaa;">+ ${cart.length - 4} more</div>`;
    }
  }

  if (totalEl) {
    const total = cart.reduce((sum, item) => sum + calculateItemPrice(item) * item.quantity, 0);
    totalEl.textContent = `$${total.toFixed(2)}`;
  }

  cartEl.classList.add("show");
  cartEl.classList.remove("minimized");
}

// ────────────────────────────────────────────────
// CHECKOUT HANDLER (cart.html)
// ────────────────────────────────────────────────
async function handleCheckout() {
  const token = getToken();
  if (!token) {
    alert("Please log in to checkout.");
    location.href = "login.html";
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    alert("Your loadout is empty.");
    return;
  }

  const checkoutBtn = document.getElementById("checkout-button");
  if (checkoutBtn) {
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = "Processing...";
  }

  try {
    const res = await fetch(`${API_BASE}/api/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        items: cart.map(item => ({
          name: item.name,
          price: calculateItemPrice(item),
          quantity: item.quantity || 1
        }))
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Checkout session creation failed");
    }

    const stripe = await stripePromise;
    if (!stripe) throw new Error("Stripe not initialized");

    const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
    if (error) throw error;
  } catch (err) {
    console.error("Checkout error:", err);
    alert("Checkout failed: " + err.message);
  } finally {
    if (checkoutBtn) {
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = "PAY SECURELY WITH STRIPE";
    }
  }
}

// ────────────────────────────────────────────────
// USER NAV / PLAYER ICON DROPDOWN
// ────────────────────────────────────────────────
function renderUserNav() {
  const userInfo = document.getElementById("user-info");
  if (!userInfo) return;

  const user = getUser();
  if (!user) {
    userInfo.innerHTML = `<a href="login.html">LOGIN</a>`;
    return;
  }

  const level = Math.floor((user.xp || 0) / 500) + 1;
  const initial = (user.email?.charAt(0) || "?").toUpperCase();

  userInfo.innerHTML = `
    <div class="player-icon" id="playerIcon">${initial}</div>
    <div class="player-dropdown" id="playerDropdown">
      <div><strong>${user.email}</strong></div>
      <div style="color:#ff6b00;">Level ${level}</div>
      <button onclick="logoutUser()">LOGOUT</button>
    </div>
  `;

  const icon = document.getElementById("playerIcon");
  const dropdown = document.getElementById("playerDropdown");

  if (icon && dropdown) {
    icon.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
      if (!userInfo.contains(e.target)) {
        dropdown.classList.remove("active");
      }
    });
  }
}

// ────────────────────────────────────────────────
// LOADOUT / OPERATOR SYSTEM (shop.html, etc.)
// ────────────────────────────────────────────────
let equipped = { optic: null, primary: null, secondary: null, accessory: null };
let operatorXP = 0;

function equipItem(product) {
  if (!product?.slot) return;

  const slotEl = document.querySelector(`.operator-slot[data-slot="${product.slot}"]`);
  if (!slotEl) return;

  equipped[product.slot] = product;

  slotEl.innerHTML = `
    <img src="${product.images?.[0] || 'placeholder.jpg'}" alt="${product.name}">
  `;

  // Add XP boost
  operatorXP += product.xpBoost || 0;
  updateOperatorStats();
  saveLoadout();
}

function updateOperatorStats() {
  let totalPower = 0, totalMobility = 0, totalStealth = 0, loadoutScore = 0;

  Object.values(equipped).forEach(item => {
    if (item?.baseStats) {
      totalPower += item.baseStats.power || 0;
      totalMobility += item.baseStats.mobility || 0;
      totalStealth += item.baseStats.stealth || 0;
      loadoutScore += item.loadoutValue || 0;
    }
  });

  const statsEl = document.getElementById("operator-stats");
  if (statsEl) {
    statsEl.innerHTML = `
      <div>Total Power: ${totalPower}</div>
      <div>Total Mobility: ${totalMobility}</div>
      <div>Total Stealth: ${totalStealth}</div>
    `;
  }

  const scoreEl = document.getElementById("loadout-score");
  if (scoreEl) {
    scoreEl.innerHTML = `<h3>LOADOUT SCORE: ${loadoutScore}</h3>`;
  }

  updateXPBar();
}

function updateXPBar() {
  const level = Math.floor(operatorXP / 500) + 1;
  const currentXP = operatorXP % 500;
  const percent = (currentXP / 500) * 100;

  const bar = document.getElementById("xp-progress");
  const text = document.getElementById("xp-text");

  if (bar) bar.style.width = `${percent}%`;
  if (text) text.textContent = `Level ${level} — ${currentXP}/500 XP`;
}

function saveLoadout() {
  localStorage.setItem("huntx_loadout", JSON.stringify({ equipped, operatorXP }));
}

function loadLoadout() {
  const saved = JSON.parse(localStorage.getItem("huntx_loadout") || "{}");
  equipped = saved.equipped || equipped;
  operatorXP = saved.operatorXP || 0;

  // Re-render slots if on page
  Object.entries(equipped).forEach(([slot, item]) => {
    const el = document.querySelector(`.operator-slot[data-slot="${slot}"]`);
    if (el && item) {
      el.innerHTML = `<img src="${item.images?.[0] || 'placeholder.jpg'}" alt="${item.name}">`;
    }
  });

  updateOperatorStats();
}

// ────────────────────────────────────────────────
// INIT – run on every page load
// ────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  renderUserNav();
  updateCartCount();
  updateFloatingCart();
  loadLoadout();

  // Attach checkout listener if button exists
  const checkoutBtn = document.getElementById("checkout-button");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", handleCheckout);
  }

  // Floating cart minimize toggle (if present)
  const toggleBtn = document.getElementById("toggle-floating");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const cart = document.getElementById("floating-cart");
      const icon = toggleBtn.querySelector("i");
      cart.classList.toggle("minimized");
      icon.classList.toggle("fa-chevron-up");
      icon.classList.toggle("fa-chevron-down");
    });
  }
});
// Dark/Light mode toggle (persists across pages)
function toggleTheme() {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  const icon = document.getElementById('themeToggle')?.querySelector('i');
  if (icon) {
    icon.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }
}

// Load saved theme on every page
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    const icon = document.getElementById('themeToggle')?.querySelector('i');
    if (icon) icon.className = 'fa-solid fa-sun';
  }

  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', toggleTheme);
  }
});