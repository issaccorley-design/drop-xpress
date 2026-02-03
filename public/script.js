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
// Updated renderShop function
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

// FILTERS & SORT — call renderShop()
function applyFilters() {
  const q = document.getElementById('search').value.toLowerCase();
  const brand = document.getElementById('brand-filter').value;
  const sort = document.getElementById('sort').value;

  filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    const matchesBrand = !brand || p.brand === brand;
    const matchesCategory = currentCategory === "all" || p.category === currentCategory;
    return matchesSearch && matchesBrand && matchesCategory;
  });

  filtered.sort((a, b) => {
    if (sort === 'price-low') return a.price - b.price;
    if (sort === 'price-high') return b.price - a.price;
    return a.name.localeCompare(b.name);
  });

  renderShop();  // ← Fixed: use renderShop()
}

function clearFilters() {
  document.getElementById('search').value = '';
  document.getElementById('brand-filter').value = '';
  document.getElementById('sort').value = 'name';
  currentCategory = "all";
  document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
  document.querySelector('.tab-btn[data-category="all"]').classList.add('active');
  filtered = [...products];
  renderShop();  // ← Fixed: use renderShop()
}

// Your other functions (addToCart, updateCartCount, etc.) remain unchanged...

// INIT – call renderShop()
document.addEventListener("DOMContentLoaded", () => {
  // Populate brands
  const brands = [...new Set(products.map(p => p.brand))].sort();
  const brandSelect = document.getElementById('brand-filter');
  if (brandSelect) {
    brandSelect.innerHTML += brands.map(b => `<option value="${b}">${b}</option>`).join('');
  }

  renderShop();  // ← Fixed: call renderShop()
  updateCartCount();
  updateFloatingCart();

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.category;
      applyFilters();
    });
  });

  // Floating cart toggle
  document.getElementById('toggle-floating')?.addEventListener('click', () => {
    const cart = document.getElementById('floating-cart');
    const icon = document.querySelector('#toggle-floating i');
    cart.classList.toggle('minimized');
    icon.classList.toggle('fa-chevron-up');
    icon.classList.toggle('fa-chevron-down');
  });
function calculateItemPrice(item) {
  // Use salePrice if it exists and is lower
  return item.salePrice && item.salePrice < item.price ? item.salePrice : item.price;
}

function renderCartAndCheckout() {
  const cart = getCart();
  const cartContainer = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");

  if (!cartContainer || !totalEl) return;

  let html = '';
  let total = 0;

  if (cart.length === 0) {
    html = `
      <p style="text-align:center; font-size:3rem; opacity:0.7; margin:6rem 0;">
        Your loadout is empty.<br>
        <a href="shop.html" style="color:#ff6b00; text-decoration:none; font-size:1.8rem;">
          ← Continue Shopping in Armory
        </a>
      </p>`;
  } else {
    cart.forEach((item, index) => {
      const price = calculateItemPrice(item);
      const lineTotal = price * item.quantity;
      total += lineTotal;

      const saleHtml = item.salePrice && item.salePrice < item.price 
        ? `<span style="color:#ff6b00; font-size:1.6rem;">Sale!</span> 
           <span style="text-decoration:line-through; color:#888; margin-left:0.8rem;">
             $${item.price.toLocaleString()}
           </span>`
        : '';

      html += `
        <div class="cart-item glass" style="display:flex; gap:2rem; align-items:center; padding:2rem; border-radius:24px; margin-bottom:2rem; position:relative;">
          <img src="${item.image}" style="width:180px; height:180px; object-fit:cover; border-radius:16px;" alt="${item.name}">
          
          <div style="flex:1;">
            <h3 style="font-size:2.5rem; margin:0 0 0.5rem;">${item.name}</h3>
            <div style="font-size:1.6rem; color:#aaa; margin-bottom:1rem;">${item.category?.toUpperCase() || ''}</div>
            
            <div style="display:flex; align-items:center; gap:1.5rem; margin:1rem 0;">
              <div style="font-size:2rem; font-weight:900; color:#ff6b00;">
                $${price.toLocaleString()} × ${item.quantity}
              </div>
              ${saleHtml}
            </div>

            <div style="display:flex; gap:1rem; margin:1.5rem 0;">
              <button onclick="changeQuantity(${index}, -1)" class="btn" style="padding:0.8rem 1.5rem; min-width:50px; font-size:1.6rem;">−</button>
              <span style="font-size:2rem; min-width:40px; text-align:center;">${item.quantity}</span>
              <button onclick="changeQuantity(${index}, 1)" class="btn" style="padding:0.8rem 1.5rem; min-width:50px; font-size:1.6rem;">+</button>
            </div>

            <button onclick="removeFromCart(${index})" style="background:#e74c3c; padding:1rem 2rem; border-radius:50px; color:white; font-size:1.4rem; border:none; cursor:pointer;">
              Remove
            </button>
          </div>

          <div style="font-size:3.2rem; font-weight:900; color:#ff6b00; white-space:nowrap;">
            $${lineTotal.toLocaleString()}
          </div>
        </div>`;
    });

    html += `
      <div style="text-align:right; margin:4rem 0; font-size:4.5rem; color:#ff6b00; font-weight:900;">
        TOTAL: $${total.toFixed(2)}
      </div>
      <div style="text-align:center;">
        <a href="shop.html" class="btn secondary" style="margin-right:2rem; padding:1.2rem 3rem; font-size:1.8rem;">
          ← Continue Shopping
        </a>
      </div>`;
  }

  cartContainer.innerHTML = html;
  totalEl.textContent = total.toFixed(2);
}

// New helper for quantity change
function changeQuantity(index, delta) {
  let cart = getCart();
  if (!cart[index]) return;

  cart[index].quantity = Math.max(1, cart[index].quantity + delta);
  saveCart(cart);
  updateCartCount();
  renderCartAndCheckout();
  updateFloatingCart();
}
  // Theme, login, register (unchanged)
  // ...
});



// ======================================================
// CART SYSTEM (uses quantity)
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

function addToCart(event, id) {
  let cart = getCart();
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  updateCartCount();
  updateFloatingCart();

  // Button feedback
  const btn = event.target;
  const originalText = btn.textContent;
  btn.textContent = "ADDED!";
  btn.style.background = "#2d8b3a";
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = "";
  }, 1200);
}

function removeFromCart(index) {
  let cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  updateCartCount();
  renderCartAndCheckout();
  updateFloatingCart();
}

// ======================================================
// AUTHENTICATION
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
    if (!res.ok) throw new Error();
    const { user } = await res.json();

    el.innerHTML = `
      ${user.email}
      <button onclick="localStorage.removeItem('token'); location.reload()" 
        class="btn" style="padding:0.5rem 1rem; font-size:0.9rem; background:#e74c3c;">
        LOGOUT
      </button>
    `;
  } catch {
    localStorage.removeItem("token");
    el.innerHTML = `<a href="login.html">LOGIN</a>`;
  }
}

// ======================================================
// FLOATING CART
// ======================================================
function updateFloatingCart() {
  const container = document.getElementById("floating-cart");
  if (!container) return;

  const cart = getCart();
  if (cart.length === 0) {
    container.classList.remove("show");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const minimized = localStorage.getItem("cartMinimized") === "true";

  container.classList.toggle("minimized", minimized);
  container.classList.add("show");

  container.innerHTML = `
    <div style="padding-bottom:1rem; border-bottom:2px solid #ff6b00; margin-bottom:1rem; font-size:1.8rem; font-weight:900; text-align:center; position:relative;">
      YOUR LOADOUT (${cart.length} item${cart.length !== 1 ? 's' : ''})
      <button id="minimize-cart-btn" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); background:none; border:none; color:#fff; font-size:2rem; cursor:pointer;">
        ${minimized ? '+' : '−'}
      </button>
    </div>

    <div id="floating-items" style="${minimized ? 'display:none;' : ''}">
      ${cart.map((item, index) => `
  <div style="display:flex; gap:0.8rem; align-items:center; margin:1rem 0;">
    <img src="${item.image}" style="width:56px; height:56px; object-fit:cover; border-radius:12px;">
    
    <div style="flex:1;">
      <div style="font-weight:700; font-size:0.95rem;">${item.name}</div>
      <div style="color:#ff8c00; font-size:0.85rem;">
        $${item.price} × ${item.quantity}
      </div>
    </div>

    <button 
      onclick="removeFromCart(${index})"
      aria-label="Remove item"
      style="
        background:#e74c3c;
        color:white;
        border:none;
        width:32px;
        height:32px;
        border-radius:50%;
        font-size:1.1rem;
        cursor:pointer;
        display:flex;
        align-items:center;
        justify-content:center;
      ">
      ×
    </button>
  </div>
`).join('')}
    </div>

    <div style="margin-top:1.5rem; padding-top:1rem; border-top:2px solid #ff6b00; text-align:center;">
      <div style="font-size:2rem; color:#ff6b00; font-weight:900;">TOTAL: $${total.toFixed(2)}</div>
      <button onclick="location.href='checkout.html'" class="btn" style="width:100%; margin-top:1rem; padding:1.2rem; font-size:1.3rem;">
        PROCEED TO CHECKOUT
      </button>
    </div>
  `;

  document.getElementById("minimize-cart-btn")?.addEventListener("click", () => {
    const isMinimized = container.classList.toggle("minimized");
    localStorage.setItem("cartMinimized", isMinimized);
    updateFloatingCart();
  });
}

// ======================================================
// CART & CHECKOUT RENDER
// ======================================================
function renderCartAndCheckout() {
  const cart = getCart();
  const cartContainer = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");

  if (!cartContainer && !totalEl) return;

  let html = "";
  let total = 0;

  if (cart.length === 0) {
    html = `<p style="text-align:center; font-size:3rem; opacity:0.7; margin:6rem 0;">Your loadout is empty.</p>`;
  } else {
    cart.forEach((item, index) => {
      const lineTotal = item.price * item.quantity;
      total += lineTotal;

      html += `
        <div style="display:flex; gap:2rem; align-items:center; padding:2.5rem; background:rgba(30,30,45,0.7); border-radius:28px; margin-bottom:2rem;">
          <img src="${item.image}" style="width:200px; border-radius:20px;">
          <div style="flex:1;">
            <h3 style="font-size:2.8rem; margin:0;">${item.name}</h3>
            <div style="color:#ff8c00; font-size:2rem; margin:0.5rem 0;">${item.brand}</div>
            <div style="font-size:1.8rem; margin:1rem 0;">Quantity: ${item.quantity}</div>
            <button onclick="removeFromCart(${index})" style="background:#e74c3c; padding:1rem 2.5rem; border-radius:50px; color:white; font-weight:900; font-size:1.3rem; border:none; cursor:pointer;">
              REMOVE FROM LOADOUT
            </button>
          </div>
          <div style="font-size:3.5rem; color:#ff6b00; font-weight:900;">
            $${lineTotal.toLocaleString()}
          </div>
        </div>
      `;
    });

    html += `
      <div style="text-align:center; margin:4rem 0; font-size:6rem; color:#ff6b00; font-weight:900;">
        TOTAL: $${total.toFixed(2)}
      </div>
    `;
  }

  if (cartContainer) cartContainer.innerHTML = html;
  if (totalEl) totalEl.textContent = total.toFixed(2);
}
// ======================================================
// CHECKOUT BUTTON
// ======================================================
document.getElementById("checkout-button")?.addEventListener("click", async () => {
  const msg = document.getElementById("msg");
  const token = getToken();

  if (!token) {
    msg.textContent = "Please login first";
    setTimeout(() => location.href = "login.html", 1200);
    return;
  }

  msg.textContent = "Redirecting to secure payment...";

  try {
    const stripe = await stripePromise;

    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({
  items: getCart().map(item => ({
    name: item.name,
    brand: item.brand || "",
    image: item.image,
    price: Number(item.price),
    quantity: Number(item.quantity)
  }))
})
    });

    if (!res.ok) {
  const text = await res.text();
  throw new Error(text || "Checkout request failed");
}
const data = await res.json();
    if (data.sessionId) {
      stripe.redirectToCheckout({ sessionId: data.sessionId });
    } else {
      msg.textContent = data.error || "Checkout failed";
    }
  } catch (err) {
    msg.textContent = "Network error";
    console.error(err);
  }
});

// ======================================================
// INIT
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  showUserStatus();
  renderShop();
  renderCartAndCheckout();
  updateFloatingCart();
  renderCartAndCheckout();   // ← ADD THIS
  updateCartCount();
  updateFloatingCart();
  showUserStatus();
  // etc.
});

  // Theme toggle
  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const isLight = document.body.classList.toggle("light-mode");
      localStorage.setItem("theme", isLight ? "light" : "dark");
      toggle.innerHTML = isLight ? `<i class="fa-solid fa-sun"></i>` : `<i class="fa-solid fa-moon"></i>`;
    });

    if (localStorage.getItem("theme") === "light") {
      document.body.classList.add("light-mode");
      toggle.innerHTML = `<i class="fa-solid fa-sun"></i>`;
    }
  }

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
