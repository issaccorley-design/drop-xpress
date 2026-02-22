// script.js (updated)

// ────────────────────────────────────────────────
// API BASE + STRIPE INIT
// ────────────────────────────────────────────────
const API_BASE =
  location.hostname === "localhost"
    ? "http://localhost:10000"
    : "https://drop-xpress.onrender.com";

let stripePromise = fetch(`${API_BASE}/api/config`)
  .then(r => {
    if (!r.ok) throw new Error("Config fetch failed");
    return r.json();
  })
  .then(({ publishableKey }) => {
    if (!publishableKey) throw new Error("Missing Stripe key");
    return Stripe(publishableKey);
  })
  .catch(err => {
    console.error("Stripe init error:", err);
    return null;
  });

// ────────────────────────────────────────────────
// CART HELPERS
// ────────────────────────────────────────────────
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll("#cart-count").forEach(el => el.textContent = count);
}

function calculateItemPrice(item) {
  return item.salePrice && item.salePrice < item.price ? item.salePrice : item.price;
}

// ────────────────────────────────────────────────
// ADD TO CART (with login check)
// ────────────────────────────────────────────────
function addToCart(id) {
  const token = localStorage.getItem('token');
  if (!token) {
    if (confirm('Login required to add to cart. Redirect to login?')) {
      window.location.href = 'login.html';
    }
    return;
  }

  const product = products.find(p => p.id === id);
  if (!product) return;

  const cart = getCart();
  const existing = cart.find(i => i.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  updateCartCount();
  alert(`${product.name} added to loadout!`);
}

// ────────────────────────────────────────────────
// RENDER CART (for cart.html)
// ────────────────────────────────────────────────
function renderCart() {
  const cartItemsEl = document.getElementById("cart-items");
  const emptyCartEl = document.getElementById("empty-cart");
  const summaryEl = document.getElementById("cart-summary");
  if (!cartItemsEl || !emptyCartEl || !summaryEl) return;

  const cart = getCart();
  if (cart.length === 0) {
    emptyCartEl.style.display = "block";
    summaryEl.style.display = "none";
    return;
  }

  emptyCartEl.style.display = "none";
  summaryEl.style.display = "block";

  let total = 0;

  cartItemsEl.innerHTML = cart.map((item, index) => {
    const itemPrice = calculateItemPrice(item);
    const subtotal = itemPrice * item.quantity;
    total += subtotal;

    return `
      <div class="cart-item glass" style="display:grid; grid-template-columns:80px 1fr auto; gap:2rem; align-items:center; padding:2rem; border-radius:24px;">
        <img src="${item.image}" style="width:100%; border-radius:12px;">
        <div>
          <h3 style="font-size:2.2rem;">${item.name}</h3>
          <div style="font-size:1.8rem; color:#ff6b00;">$${itemPrice.toFixed(2)}</div>
        </div>
        <div style="display:flex; align-items:center; gap:1.5rem; font-size:2rem;">
          <button onclick="updateQuantity(${index}, -1)" style="background:none; border:none; color:#fff; cursor:pointer; font-size:2.5rem;">−</button>
          <span>${item.quantity}</span>
          <button onclick="updateQuantity(${index}, 1)" style="background:none; border:none; color:#fff; cursor:pointer; font-size:2.5rem;">+</button>
          <button onclick="removeFromCart(${index})" style="background:none; border:none; color:#ff6b00; cursor:pointer; font-size:2rem;"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    `;
  }).join("");

  document.getElementById("cart-subtotal").textContent = `$${total.toFixed(2)}`;
  document.getElementById("cart-total").textContent = `$${total.toFixed(2)}`; // Add shipping/tax logic if needed
}

// ────────────────────────────────────────────────
// CART ACTIONS
// ────────────────────────────────────────────────
function updateQuantity(index, change) {
  const cart = getCart();
  cart[index].quantity += change;
  if (cart[index].quantity < 1) cart[index].quantity = 1;
  saveCart(cart);
  renderCart();
  updateCartCount();
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
  updateCartCount();
}

// ────────────────────────────────────────────────
// CHECKOUT HANDLER (with login check)
// ────────────────────────────────────────────────
async function handleCheckout() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Login required for checkout. Redirecting...');
    window.location.href = 'login.html';
    return;
  }

  const cart = getCart();
  if (cart.length === 0) return alert('Loadout empty');

  try {
    const res = await fetch(`${API_BASE}/api/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        items: cart.map(item => ({
          name: item.name,
          price: calculateItemPrice(item),
          quantity: item.quantity
        }))
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Checkout failed");

    const stripe = await stripePromise;
    if (!stripe) throw new Error("Stripe not loaded");

    const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
    if (error) throw error;
  } catch (err) {
    console.error("Checkout error:", err);
    alert("Checkout failed: " + err.message);
  }
}

// ────────────────────────────────────────────────
// AUTH & USER STATUS
// ────────────────────────────────────────────────
function getUserEmailFromToken(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload);
    const { email } = JSON.parse(decoded);
    return email || 'User';
  } catch {
    return null;
  }
}

function showUserStatus() {
  const token = localStorage.getItem('token');
  const userInfo = document.getElementById('user-info');
  
  if (!userInfo) return; // page doesn't have this element

  if (token) {
    const email = getUserEmailFromToken(token);
    userInfo.innerHTML = `
      ${email} | 
      <a href="#" id="logout">LOGOUT</a>
    `;
    document.getElementById('logout')?.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      showUserStatus();
      alert('Logged out');
      window.location.href = 'index.html';
    });
  } else {
    userInfo.innerHTML = `<a href="login.html">LOGIN</a>`;
  }
}

// In DOMContentLoaded listener (add this line if missing):
document.addEventListener("DOMContentLoaded", () => {
  showUserStatus();          // ← ADD THIS
  updateCartCount();
  // ... other inits
});
function logout(e) {
  e.preventDefault();
  localStorage.removeItem('token');
  showUserStatus();
  alert('Logged out');
  if (location.pathname.includes('profile.html')) window.location.href = 'index.html';
}

// ────────────────────────────────────────────────
// LOGIN HANDLER
// ────────────────────────────────────────────────
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    const msgEl = document.getElementById('msg');

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.token);
      msgEl.textContent = 'Login successful! Redirecting...';
      msgEl.style.color = '#2d8b3a';
      setTimeout(() => window.location.href = 'shop.html', 1500);
    } catch (err) {
      msgEl.textContent = err.message;
      msgEl.style.color = '#ff6b00';
    }
  });
}

// ────────────────────────────────────────────────
// REGISTER HANDLER
// ────────────────────────────────────────────────
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('newEmail').value;
    const password = document.getElementById('newPassword').value;
    const msgEl = document.getElementById('msg');

    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      localStorage.setItem('token', data.token);
      msgEl.textContent = 'Registration successful! Redirecting...';
      msgEl.style.color = '#2d8b3a';
      setTimeout(() => window.location.href = 'shop.html', 1500);
    } catch (err) {
      msgEl.textContent = err.message;
      msgEl.style.color = '#ff6b00';
    }
  });
}

// ────────────────────────────────────────────────
// PROFILE HANDLER (for profile.html)
// ────────────────────────────────────────────────
async function loadProfile() {
  const token = localStorage.getItem('token');
  if (!token) {
    document.getElementById('profileData').innerHTML = '<p>Please login to view profile.</p>';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load profile');
    document.getElementById('profileData').innerHTML = `<p>Email: ${data.user.email}</p>`;
  } catch (err) {
    document.getElementById('profileData').innerHTML = `<p>Error: ${err.message}</p>`;
  }
}

// ────────────────────────────────────────────────
// CHECKOUT.HTML SPECIFIC (render total + attach button)
// ────────────────────────────────────────────────
if (document.getElementById('cart-total')) {
  const total = getCart().reduce((sum, item) => sum + calculateItemPrice(item) * item.quantity, 0);
  document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
}

const checkoutButton = document.getElementById('checkout-button');
if (checkoutButton) {
  checkoutButton.addEventListener('click', handleCheckout);
}

// ────────────────────────────────────────────────
// GLOBAL INIT (run on all pages)
// ────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  showUserStatus();
  updateCartCount();

  // Page-specific inits
  if (document.getElementById("cart-items")) renderCart();
  if (document.getElementById("profileData")) loadProfile();

  // Cart quantity buttons (if on cart.html)
  // Reviews logic on product.html is already in inline script
});