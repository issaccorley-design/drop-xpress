// ======================================================
// STRIPE INIT
// ======================================================
let stripePromise = fetch("/api/config")
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

// ======================================================
// SHOP RENDER
// ======================================================
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

// ======================================================
// FILTERS & SORT
// ======================================================
function applyFilters() {
  const q = document.getElementById('search')?.value.toLowerCase() || '';
  const brand = document.getElementById('brand-filter')?.value || '';
  const sort = document.getElementById('sort')?.value || 'name';

  filtered = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q);

    const matchesBrand = !brand || p.brand === brand;
    const matchesCategory =
      currentCategory === "all" || p.category === currentCategory;

    return matchesSearch && matchesBrand && matchesCategory;
  });

  filtered.sort((a, b) => {
    if (sort === 'price-low') return a.price - b.price;
    if (sort === 'price-high') return b.price - a.price;
    return a.name.localeCompare(b.name);
  });

  renderShop();
}

function clearFilters() {
  document.getElementById('search').value = '';
  document.getElementById('brand-filter').value = '';
  document.getElementById('sort').value = 'name';

  currentCategory = "all";
  filtered = [...products];

  document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
  document.querySelector('.tab-btn[data-category="all"]')?.classList.add('active');

  renderShop();
}

// ======================================================
// CART STORAGE
// ======================================================
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll("#cart-count").forEach(el => {
    el.textContent = count;
  });
}

// ======================================================
// CART HELPERS
// ======================================================
function calculateItemPrice(item) {
  return item.salePrice && item.salePrice < item.price
    ? item.salePrice
    : item.price;
}

function addToCart(event, id) {
  let cart = getCart();
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  updateCartCount();
  updateFloatingCart();

  if (event?.target) {
    const btn = event.target;
    const original = btn.textContent;
    btn.textContent = "ADDED!";
    btn.style.background = "#2d8b3a";
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = "";
    }, 1200);
  }
}

function removeFromCart(index) {
  let cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  updateCartCount();
  renderCartAndCheckout();
  updateFloatingCart();
}

function changeQuantity(index, delta) {
  let cart = getCart();
  if (!cart[index]) return;

  cart[index].quantity = Math.max(1, cart[index].quantity + delta);
  saveCart(cart);

  updateCartCount();
  renderCartAndCheckout();
  updateFloatingCart();
}

// ======================================================
// CART PAGE RENDER
// ======================================================
function renderCartAndCheckout() {
  const cart = getCart();
  const cartContainer = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");

  if (!cartContainer || !totalEl) return;

  let html = "";
  let total = 0;

  if (cart.length === 0) {
    html = `
      <p style="text-align:center;font-size:3rem;opacity:.7;margin:6rem 0;">
        Your loadout is empty.<br>
        <a href="shop.html" style="color:#ff6b00;text-decoration:none;font-size:1.8rem;">
          ← Continue Shopping
        </a>
      </p>`;
  } else {
    cart.forEach((item, index) => {
      const price = calculateItemPrice(item);
      const lineTotal = price * item.quantity;
      total += lineTotal;

      html += `
        <div class="cart-item glass" style="display:flex;gap:2rem;padding:2rem;margin-bottom:2rem;">
          <img src="${item.image}" style="width:180px;border-radius:16px;">
          <div style="flex:1;">
            <h3 style="font-size:2.5rem;">${item.name}</h3>
            <div style="color:#aaa;">${item.category || ''}</div>
            <div style="color:#ff6b00;font-size:2rem;">
              $${price} × ${item.quantity}
            </div>
            <div style="margin:1rem 0;">
              <button onclick="changeQuantity(${index},-1)" class="btn">−</button>
              <span style="margin:0 1rem;">${item.quantity}</span>
              <button onclick="changeQuantity(${index},1)" class="btn">+</button>
            </div>
            <button onclick="removeFromCart(${index})" class="btn" style="background:#e74c3c;">
              Remove
            </button>
          </div>
          <div style="font-size:3rem;color:#ff6b00;">
            $${lineTotal.toFixed(2)}
          </div>
        </div>`;
    });

    html += `
      <div style="text-align:right;font-size:4rem;color:#ff6b00;">
        TOTAL: $${total.toFixed(2)}
      </div>`;
  }

  cartContainer.innerHTML = html;
  totalEl.textContent = total.toFixed(2);
}

// ======================================================
// FLOATING CART
// ======================================================
function updateFloatingCart() {
  const container = document.getElementById("floating-cart");
  if (!container) return;

  const cart = getCart();
  if (!cart.length) {
    container.classList.remove("show");
    return;
  }

  const total = cart.reduce(
    (s, i) => s + calculateItemPrice(i) * i.quantity,
    0
  );

  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);
  const minimized = localStorage.getItem("cartMinimized") === "true";

  container.classList.add("show");
  container.classList.toggle("minimized", minimized);

  container.innerHTML = `
    <div style="text-align:center;font-weight:900;">
      YOUR LOADOUT (${itemCount})
      <button id="minimize-cart-btn">${minimized ? '+' : '−'}</button>
    </div>

    <div style="${minimized ? 'display:none;' : ''}">
      ${cart.map((item, i) => `
        <div style="display:flex;gap:.5rem;margin:1rem 0;">
          <img src="${item.image}" style="width:50px;border-radius:10px;">
          <div style="flex:1;">
            ${item.name}<br>
            $${calculateItemPrice(item)} × ${item.quantity}
          </div>
          <button onclick="removeFromCart(${i})">×</button>
        </div>
      `).join('')}
    </div>

    <div style="text-align:center;">
      TOTAL: $${total.toFixed(2)}
      <button onclick="location.href='checkout.html'" class="btn">
        CHECKOUT
      </button>
    </div>
  `;

  document.getElementById("minimize-cart-btn")?.addEventListener("click", () => {
    const m = container.classList.toggle("minimized");
    localStorage.setItem("cartMinimized", m);
    updateFloatingCart();
  });
}

// ======================================================
// AUTH
// ======================================================
function getToken() {
  return localStorage.getItem("token");
}

async function showUserStatus() {
  const el = document.getElementById("user-info");
  if (!el) return;

  const token = getToken();
  if (!token) {
    el.innerHTML = `<a href="login.html">LOGIN</a>`;
    return;
  }

  try {
    const res = await fetch("/api/profile", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const { user } = await res.json();

    el.innerHTML = `
      ${user.email}
      <button onclick="localStorage.removeItem('token');location.reload()">
        LOGOUT
      </button>`;
  } catch {
    localStorage.removeItem("token");
    el.innerHTML = `<a href="login.html">LOGIN</a>`;
  }
}

// ======================================================
// INIT
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
  // ===== Shop init =====
  if (typeof products !== "undefined") {
    const brands = [...new Set(products.map(p => p.brand))].sort();
    const brandSelect = document.getElementById("brand-filter");
    if (brandSelect) {
      brandSelect.innerHTML += brands
        .map(b => `<option value="${b}">${b}</option>`)
        .join("");
    }

    document.querySelectorAll(".tab-btn").forEach(tab => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn")
          .forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentCategory = tab.dataset.category;
        applyFilters();
      });
    });
  }

  updateCartCount();
  renderShop();
  renderCartAndCheckout();
  updateFloatingCart();
  showUserStatus();

  // ===== Checkout =====
  const checkoutBtn =
    document.getElementById("checkout-button") ||
    document.getElementById("checkout-btn");

  if (!checkoutBtn) return;

  checkoutBtn.addEventListener("click", async () => {
    try {
      console.log("CREATE OPERATIVE clicked");

      const token = getToken();
      if (!token) {
        location.href = "login.html";
        return;
      }

      const cart = getCart();
      if (!cart.length) {
        alert("Your cart is empty");
        return;
      }

      const stripe = await stripePromise;
      if (!stripe) {
        alert("Stripe failed to load");
        return;
      }

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart.map(i => ({
            name: i.name,
            brand: i.brand || "",
            image: i.image,
            price: Number(calculateItemPrice(i)),
            quantity: Number(i.quantity)
          }))
        })
      });

      const data = await res.json();

      if (res.status === 401) {
        alert("Please log in before checkout");
        location.href = "login.html";
        return;
      }

      if (!res.ok) {
        console.error("Checkout error:", data);
        document.getElementById("msg").textContent =
          data.error || "Checkout failed";
        return;
      }

      if (!data.sessionId) {
        document.getElementById("msg").textContent =
          "Stripe session not created";
        return;
      }

      const result = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });

      if (result.error) {
        console.error("Stripe redirect error:", result.error);
        document.getElementById("msg").textContent =
          result.error.message;
      }

    } catch (err) {
      console.error("Checkout exception:", err);
      document.getElementById("msg").textContent =
        err?.message || "Checkout failed. Check console.";
    }
  });
});

  // Login button
  document.getElementById("login")?.addEventListener("click", async () => {
    const email = document.getElementById("email")?.value.trim();
    const pass = document.getElementById("password")?.value;

    if (!email || !pass) {
      document.getElementById("msg").textContent = "Fill all fields";
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });

      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        location.href = "index.html";
      } else {
        document.getElementById("msg").textContent = data.message || "Login failed";
      }
    } catch {
      document.getElementById("msg").textContent = "Server error";
    }
  });

  // Register button
  document.getElementById("register")?.addEventListener("click", async () => {
    const email = document.getElementById("newEmail")?.value.trim();
    const pass = document.getElementById("newPassword")?.value;

    if (!email || !pass) {
      document.getElementById("msg").textContent = "Fill all fields";
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });

      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        location.href = "index.html";
      } else {
        document.getElementById("msg").textContent = data.message || "Register failed";
      }
    } catch {
      document.getElementById("msg").textContent = "Server error";
    }
  });
