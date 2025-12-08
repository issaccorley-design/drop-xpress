const products = [
  {id:1,name:"Mathews V3X 31",brand:"Mathews",price:1299,image:"https://images.unsplash.com/photo-1603217192634-1919e42ed8ed?w=800"},
  {id:2,name:"Hoyt Ventum Pro",brand:"Hoyt",price:1399,image:"https://images.unsplash.com/photo-1626806646068-51e8d2e8e0b5?w=800"},
  {id:3,name:"Leupold VX-6HD",brand:"Leupold",price:1899,image:"https://images.unsplash.com/photo-1588166525140-28d9b2c8a049?w=800"},
  {id:4,name:"Sitka Fanatic Set",brand:"Sitka Gear",price:899,image:"https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=800"},
  {id:5,name:"Vortex Razor HD",brand:"Vortex",price:1699,image:"https://images.unsplash.com/photo-1621905251933-5d0648d3c33d?w=800"},
  {id:6,name:"KUIU Pro Pack",brand:"KUIU",price:599,image:"https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800"},
  {id:7,name:"Sig Sauer Cross",brand:"Sig Sauer",price:2199,image:"https://images.unsplash.com/photo-1588166525140-28d9b2c8a049?w=1000"},
  {id:8,name:"Garmin inReach Mini 2",brand:"Garmin",price:399,image:"https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=1000"},
  {id:9,name:"Yeti Tundra 65",brand:"Yeti",price:399,image:"https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=1000"}
];

// ======================================================
// STRIPE LOADING (SAFE)
// ======================================================
let stripePromise = fetch("/api/config")
  .then(r => r.json())
  .then(({ publishableKey }) => Stripe(publishableKey));

// ======================================================
// CART SYSTEM
// ======================================================
function getCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Update cart bubble count
function updateCartCount() {
  const count = getCart().reduce((s, i) => s + i.quantity, 0);
  document.querySelectorAll("#cart-count").forEach(el => el.textContent = count);
}

// Add product to cart
function addToCart(event, id) {
  const product = products.find(p => p.id === id);
  let cart = getCart();

  const existing = cart.find(i => i.id === id);
  if (existing) existing.quantity++;
  else cart.push({ ...product, quantity: 1 });

  saveCart(cart);
  updateCartCount();
  updateFloatingCart();

  // Button animation
  const btn = event.target;
  btn.textContent = "ADDED!";
  btn.style.background = "#2d8b3a";
  setTimeout(() => {
    btn.textContent = "ADD TO LOADOUT";
    btn.style.background = "";
  }, 1200);
}

// Remove item
function removeFromCart(index) {
  let cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  updateCartCount();
  renderCartAndCheckout();
  updateFloatingCart();
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
    const res = await fetch("/api/profile", { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error();
    const { user } = await res.json();

    el.innerHTML = `
      ${user.email}
      <button onclick="localStorage.removeItem('token');location.reload()" class="btn" 
      style="padding:0.5rem 1rem;font-size:0.9rem;background:#e74c3c;">LOGOUT</button>
    `;
  } catch {
    localStorage.removeItem("token");
    el.innerHTML = `<a href="login.html">LOGIN</a>`;
  }
}

// ======================================================
// FLOATING CART (FIXED + SMOOTH + PERSISTENT TOGGLE)
// ======================================================
function updateFloatingCart() {
  const container = document.getElementById("floating-cart");
  if (!container) return;

  const cart = getCart();
  if (cart.length === 0) {
    container.classList.remove("show");
    return;
  }

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const minimized = localStorage.getItem("cartMinimized") === "true";

  container.classList.toggle("minimized", minimized);

  container.innerHTML = `
    <div style="padding-bottom:1rem;border-bottom:2px solid #ff6b00;
    margin-bottom:1rem;font-size:1.8rem;font-weight:900;text-align:center;position:relative;">
      YOUR LOADOUT (${cart.length} item${cart.length > 1 ? "s" : ""})
      <button id="minimize-cart-btn" style="position:absolute;right:10px;top:50%;
      transform:translateY(-50%);background:none;border:none;color:#fff;font-size:2rem;cursor:pointer;">
        ${minimized ? "+" : "−"}
      </button>
    </div>

    <div id="floating-items" style="${minimized ? "display:none;" : ""}">
      ${cart.map(i => `
        <div style="display:flex;gap:1rem;align-items:center;margin:1rem 0;">
          <img src="${i.image}" style="width:60px;height:60px;object-fit:cover;border-radius:12px;">
          <div style="flex:1;">
            <div style="font-weight:700;">${i.name}</div>
            <div style="color:#ff8c00;">$${i.price} × ${i.quantity}</div>
          </div>
        </div>
      `).join("")}
    </div>

    <div style="margin-top:1.5rem;padding-top:1rem;border-top:2px solid #ff6b00;text-align:center;">
      <div style="font-size:2rem;color:#ff6b00;font-weight:900;">TOTAL: $${total.toFixed(2)}</div>
      <button onclick="location.href='checkout.html'" class="btn" 
      style="width:100%;margin-top:1rem;padding:1.2rem;font-size:1.3rem;">
        PROCEED TO CHECKOUT
      </button>
    </div>
  `;

  container.classList.add("show");

  document.getElementById("minimize-cart-btn").addEventListener("click", () => {
    const minimizedNow = container.classList.toggle("minimized");
    localStorage.setItem("cartMinimized", minimizedNow);
    updateFloatingCart();
  });
}

// ======================================================
// CART PAGE + CHECKOUT PAGE RENDER
// ======================================================
function renderCartAndCheckout() {
  const cart = getCart();
  const cartContainer = document.getElementById("cart-items");
  const checkoutContainer = document.getElementById("cart-preview");
  const totalEl = document.getElementById("cart-total");

  // If neither exists, skip
  if (!cartContainer && !checkoutContainer) return;

  let html = "";
  let total = 0;

  if (cart.length === 0) {
    html = `<p style="text-align:center;font-size:3rem;opacity:0.7;margin:6rem 0;">
      Your loadout is empty.
    </p>`;
  } else {
    cart.forEach((item, i) => {
      const lineTotal = item.price * item.quantity;
      total += lineTotal;

      html += `
        <div style="display:flex;gap:2rem;align-items:center;padding:2.5rem;
        background:rgba(30,30,45,0.7);border-radius:28px;margin-bottom:2rem;">
          <img src="${item.image}" style="width:200px;border-radius:20px;">
          <div style="flex:1;">
            <h3 style="font-size:2.8rem;margin:0;">${item.name}</h3>
            <div style="color:#ff8c00;font-size:2rem;margin:0.5rem 0;">${item.brand}</div>
            <div style="font-size:1.8rem;margin:1rem 0;">Quantity: ${item.quantity}</div>

            ${cartContainer ? `
              <button onclick="removeFromCart(${i})" 
              style="background:#e74c3c;padding:1rem 2.5rem;border-radius:50px;
              color:white;font-weight:900;font-size:1.3rem;border:none;cursor:pointer;">
                REMOVE FROM LOADOUT
              </button>` : ""}
          </div>
          <div style="font-size:3.5rem;color:#ff6b00;font-weight:900;">
            $${lineTotal.toLocaleString()}
          </div>
        </div>
      `;
    });

    html += `
      <div style="text-align:center;margin:4rem 0;font-size:6rem;color:#ff6b00;font-weight:900;">
        TOTAL: $${total.toFixed(2)}
      </div>
    `;
  }

  const target = cartContainer || checkoutContainer;
  target.innerHTML = html;

  if (totalEl) totalEl.textContent = total.toFixed(2);
}

// ======================================================
// SHOP PAGE GRID RENDER (FIXED FILTERED BUG)
// ======================================================
function renderShop() {
  const grid = document.getElementById("products-grid");
  if (!grid) return;

  const list = window.filtered || products;

  grid.innerHTML = list.map(p => `
    <div class="product-card glass">
      <img src="${p.image}" loading="lazy" alt="${p.name}">
      <div class="product-info">
        <h3>${p.name}</h3>
        <div class="brand">${p.brand}</div>
        <div class="price-tag">$${p.price.toLocaleString()}</div>
        <button class="add-btn" onclick="addToCart(event, ${p.id})">ADD TO LOADOUT</button>
      </div>
    </div>
  `).join("");
}

// ======================================================
// CHECKOUT
// ======================================================
document.getElementById("checkout-button")?.addEventListener("click", async () => {
  const msg = document.getElementById("msg");
  const token = getToken();

  if (!token) {
    msg.textContent = "Please login first";
    return setTimeout(() => location.href = "login.html", 1200);
  }

  msg.textContent = "Redirecting to secure payment...";

  try {
    const stripe = await stripePromise;

    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      body: JSON.stringify({ items: getCart() })
    });

    const data = await res.json();
    if (data.sessionId) stripe.redirectToCheckout({ sessionId: data.sessionId });
    else msg.textContent = data.error || "Checkout failed";

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

  // Theme
  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const light = document.body.classList.toggle("light-mode");
      localStorage.setItem("theme", light ? "light" : "dark");
      toggle.innerHTML = light ? `<i class="fa-solid fa-sun"></i>` : `<i class="fa-solid fa-moon"></i>`;
    });

    if (localStorage.getItem("theme") === "light") {
      document.body.classList.add("light-mode");
      toggle.innerHTML = `<i class="fa-solid fa-sun"></i>`;
    }
  }

  // Login
  document.getElementById("login")?.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("password").value;

    if (!email || !pass) return (document.getElementById("msg").textContent = "Fill all fields");

    try {
      const res = await fetch("/api/login", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ email, password:pass })
      });

      const d = await res.json();
      if (d.token) {
        localStorage.setItem("token", d.token);
        location.href = "index.html";
      } else document.getElementById("msg").textContent = d.message || "Login failed";

    } catch {
      document.getElementById("msg").textContent = "Server error";
    }
  });

  // Register
  document.getElementById("register")?.addEventListener("click", async () => {
    const email = document.getElementById("newEmail").value.trim();
    const pass = document.getElementById("newPassword").value;

    if (!email || !pass) return (document.getElementById("msg").textContent = "Fill all fields");

    try {
      const res = await fetch("/api/register", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ email, password:pass })
      });

      const d = await res.json();
      if (d.token) {
        localStorage.setItem("token", d.token);
        location.href = "index.html";
      } else document.getElementById("msg").textContent = d.message || "Register failed";

    } catch {
      document.getElementById("msg").textContent = "Server error";
    }
  });
});
