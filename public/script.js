const API_BASE =
  location.hostname === "localhost"
    ? "http://localhost:10000"
    : location.origin;

// ────────────────────────────────────────────────
// Stripe initialization
// ────────────────────────────────────────────────
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
// SHOP RENDER
// ────────────────────────────────────────────────
function renderShop() {
  const grid = document.getElementById("products-grid");
  if (!grid) return;

  const list = window.filtered || products;

  grid.innerHTML = list.map(p => `
    <a href="product.html?id=${p.id}" class="product-card glass" style="text-decoration:none;color:inherit;">
      <img src="${p.image}" loading="lazy" alt="${p.name}">
      <div class="product-info">
        <h3>${p.name}</h3>
        <div class="price-tag">$${p.price}</div>
      </div>
    </a>
  `).join("");
}

// ────────────────────────────────────────────────
// CART + AUTH HELPERS (unchanged)
// ────────────────────────────────────────────────
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const count = getCart().reduce((s, i) => s + i.quantity, 0);
  document.querySelectorAll("#cart-count").forEach(el => el.textContent = count);
}

function calculateItemPrice(item) {
  return item.salePrice && item.salePrice < item.price
    ? item.salePrice
    : item.price;
}

function getToken() {
  return localStorage.getItem("token");
}

// ────────────────────────────────────────────────
// CHECKOUT (FIXED — STRIPE REDIRECT ADDED)
// ────────────────────────────────────────────────
async function handleCheckout() {
  try {
    const stripe = await stripePromise;
    if (!stripe) {
      alert("Stripe failed to load");
      return;
    }

    const cart = getCart();
    if (!cart.length) {
      alert("Your cart is empty");
      return;
    }

    const token = getToken();
    if (!token) {
      alert("Please log in to checkout");
      return;
    }

    const res = await fetch(`${API_BASE}/api/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        items: cart.map(i => ({
          name: i.name,
          price: Number(calculateItemPrice(i)),
          quantity: Number(i.quantity)
        }))
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Checkout failed");

    await stripe.redirectToCheckout({ sessionId: data.sessionId });
  } catch (err) {
    console.error("Checkout error:", err);
    alert("Checkout failed — see console");
  }
}

// ────────────────────────────────────────────────
// INIT
// ────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderShop();

  const checkoutBtn =
    document.getElementById("checkout-button") ||
    document.getElementById("checkout-btn");

  checkoutBtn?.addEventListener("click", handleCheckout);
});