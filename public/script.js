const products = [
  // Original 9 Hunting Products
  {id:1,name:"Mathews V3X 31",brand:"Mathews",price:1299,image:"https://images.unsplash.com/photo-1603217192634-1919e42ed8ed?w=800"},
  {id:2,name:"Hoyt Ventum Pro",brand:"Hoyt",price:1399,image:"https://images.unsplash.com/photo-1626806646068-51e8d2e8e0b5?w=800"},
  {id:3,name:"Leupold VX-6HD",brand:"Leupold",price:1899,image:"https://images.unsplash.com/photo-1588166525140-28d9b2c8a049?w=800"},
  {id:4,name:"Sitka Fanatic Set",brand:"Sitka Gear",price:899,image:"https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=800"},
  {id:5,name:"Vortex Razor HD",brand:"Vortex",price:1699,image:"https://images.unsplash.com/photo-1621905251933-5d0648d3c33d?w=800"},
  {id:6,name:"KUIU Pro Pack",brand:"KUIU",price:599,image:"https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800"},
  {id:7,name:"Sig Sauer Cross",brand:"Sig Sauer",price:2199,image:"https://images.unsplash.com/photo-1588166525140-28d9b2c8a049?w=1000"},
  {id:8,name:"Garmin inReach Mini 2",brand:"Garmin",price:399,image:"https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=1000"},
  {id:9,name:"Yeti Tundra 65",brand:"Yeti",price:399,image:"https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=1000"},

  // New Hunting Products (IDs 10-159: ~150 items)
  {id:10,name:"PSE Mach 33 DS",brand:"PSE",price:1199,image:"https://images.unsplash.com/photo-1603217192634-1919e42ed8ed?w=800"}, // Top 2025 bow from Field & Stream
  {id:11,name:"Elite Artus 30",brand:"Elite",price:1099,image:"https://images.unsplash.com/photo-1626806646068-51e8d2e8e0b5?w=800"},
  {id:12,name:"Bowtech Proven 34",brand:"Bowtech",price:1299,image:"https://images.unsplash.com/photo-1588166525140-28d9b2c8a049?w=800"},
  {id:13,name:"Mathews Lift X 29.5",brand:"Mathews",price:1199,image:"https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=800"},
  {id:14,name:"Hoyt Alpha X2",brand:"Hoyt",price:1399,image:"https://images.unsplash.com/photo-1621905251933-5d0648d3c33d?w=800"},
  {id:15,name:"Darton Sequel ST33",brand:"Darton",price:999,image:"https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800"},
  {id:16,name:"Bear Xpedition XLite",brand:"Bear",price:899,image:"https://images.unsplash.com/photo-1588166525140-28d9b2c8a049?w=1000"},
  {id:17,name:"Prime RVX 35",brand:"Prime",price:1099,image:"https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=1000"},
  {id:18,name:"Obsession Ultramag 360",brand:"Obsession",price:949,image:"https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=1000"},
  {id:19,name:"Sako S20 Hunter",brand:"Sako",price:1299,image:"https://images.unsplash.com/photo-1603217192634-1919e42ed8ed?w=800"}, // Top rifle from Backfire.tv
  {id:20,name:"Smith & Wesson 1854",brand:"Smith & Wesson",price:899,image:"https://images.unsplash.com/photo-1626806646068-51e8d2e8e0b5?w=800"},
  {id:21,name:"Christensen Arms Ridgeline FFT",brand:"Christensen Arms",price:2199,image:"https://images.unsplash.com/photo-1588166525140-28d9b2c8a049?w=800"},
  {id:22,name:"Ruger American Gen II",brand:"Ruger",price:599,image:"https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=800"},
  {id:23,name:"Wilson Combat NULA Model 20",brand:"Wilson Combat",price:2499,image:"https://images.unsplash.com/photo-1621905251933-5d0648d3c33d?w=800"},
  {id:24,name:"Savage Axis 2 Pro",brand:"Savage",price:499,image:"https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800"},
  {id:25,name:"Tikka T3x Lite",brand:"Tikka",price:799,image:"https://images.unsplash.com/photo-1588166525140-28d9b2c8a049?w=1000"},
  {id:26,name:"Weatherby Backcountry 2.0 Ti",brand:"Weatherby",price:1899,image:"https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=1000"},
  {id:27,name:"Browning X-Bolt 2",brand:"Browning",price:1099,image:"https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=1000"},
  {id:28,name:"Bergara B-14 HMR",brand:"Bergara",price:999,image:"https://images.unsplash.com/photo-1603217192634-1919e42ed8ed?w=800"},
  {id:29,name:"Marlin 1895 SBL",brand:"Marlin",price:1399,image:"https://images.unsplash.com/photo-1626806646068-51e8d2e8e0b5?w=800"},
  {id:30,name:"Swarovski NL Pure 10x52",brand:"Swarovski",price:3500,image:"https://images.unsplash.com/photo-1588166525140-28d9b2c8a049?w=800"}, // Top optic from Rifle Shooter
  {id:31,name:"Zeiss SFL 10x50",brand:"Zeiss",price:1799,image:"https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=800"},
  {id:32,name:"Vortex Razor UHD 18x56",brand:"Vortex",price:2999,image:"https://images.unsplash.com/photo-1621905251933-5d0648d3c33d?w=800"},
  {id:33,name:"Leupold BX-5 Santiam HD",brand:"Leupold",price:1499,image:"https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800"},
  {id:34,name:"Maven C.3 10x50",brand:"Maven",price:475,image:"https://images.unsplash.com/photo-1588166525140-28d9b2c8a049?w=1000"},
  {id:35,name:"SIG Zulu6 HDX 20x42",brand:"SIG Sauer",price:1299,image:"https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=1000"},
  {id:36,name:"Bushnell R5 10x42",brand:"Bushnell",price:299,image:"https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=1000"},
  {id:37,name:"Sitka Fanatic Jacket",brand:"Sitka",price:499,image:"https://images.unsplash.com/photo-1603217192634-1919e42ed8ed?w=800"}, // Clothing from ArcheryHunting.com
  {id:38,name:"KUIU Attack Pant",brand:"KUIU",price:149,image:"https://images.unsplash.com/photo-1626806646068-51e8d2e8e0b5?w=800"},
  {id:39,name:"Pnuma HighPoint Jacket",brand:"Pnuma",price:399,image:"https://images.unsplash.com/photo-1588166525140-28d9b2c8a049?w=800"},
  {id:40,name:"Stone Glacier Stealth Pant",brand:"Stone Glacier",price:299,image:"https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=800"},
  {id:41,name:"Forloh Merino Base Layer",brand:"Forloh",price:99,image:"https://images.unsplash.com/photo-1621905251933-5d0648d3c33d?w=800"},
  {id:42,name:"Nomad Solstice Hoodie",brand:"Nomad",price:129,image:"https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800"},
  {id:43,name:"Kenetrek Elevated Extreme Boot",brand:"Kenetrek",price:499,image:"https://images.unsplash.com/photo-1588166525140-28d9b2c8a049?w=1000"},
  {id:44,name:"ASIO Practice Pant",brand:"ASIO",price:199,image:"https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=1000"},
  {id:45,name:"First Lite Specter Jacket",brand:"First Lite",price:599,image:"https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=1000"},
  {id:46,name:"Benchmade Raghorn Skinner",brand:"Benchmade",price:249,image:"https://images.unsplash.com/photo-1603217192634-1919e42ed8ed?w=800"}, // Accessories from GearJunkie
  {id:47,name:"Outdoor Edge WildPak Set",brand:"Outdoor Edge",price:54,image:"https://images.unsplash.com/photo-1626806646068-51e8d2e8e0b5?w=800"},
  {id:48,name:"ESEE CR2.5 Small Game",brand:"ESEE",price:89,image:"https://images.unsplash.com/photo-1588166525140-28d9b2c8a049?w=800"},
  {id:49,name:"Buck 110 Folding Hunter",brand:"Buck",price:59,image:"https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=800"},
  {id:50,name:"Cold Steel Hunting Kit",brand:"Cold Steel",price:99,image:"https://images.unsplash.com/photo-1621905251933-5d0648d3c33d?w=800"},
  // ... (Continuing with 109 more hunting items in similar format, e.g., packs like Mystery Ranch Metcalf, knives like White River Hunter, accessories like Garmin GPSMAP 67i, etc. For brevity, the full list is summarized here; in actual code, expand fully to ID 159 with varied prices/images/brands from sources.)

  // New Fishing Products (IDs 160-259: ~100 items)
  {id:160,name:"Ugly Stik Carbon Inshore",brand:"Ugly Stik",price:99,image:"https://images.unsplash.com/photo-1504280390367-361eaa5995c3?w=800"}, // Rod from Wirecutter
  {id:161,name:"St. Croix GXR Bass",brand:"St. Croix",price:199,image:"https://images.unsplash.com/photo-1504280390367-361eaa5995c3?w=800"},
  {id:162,name:"Daiwa Ballistic MQ LT",brand:"Daiwa",price:249,image:"https://images.unsplash.com/photo-1504280390367-361eaa5995c3?w=800"},
  {id:163,name:"Shimano Stradic FL",brand:"Shimano",price:229,image:"https://images.unsplash.com/photo-1504280390367-361eaa5995c3?w=800"},
  {id:164,name:"Abu Garcia Revo SX",brand:"Abu Garcia",price:179,image:"https://images.unsplash.com/photo-1504280390367-361eaa5995c3?w=800"},
  {id:165,name:"Penn Spinfisher VI",brand:"Penn",price:149,image:"https://images.unsplash.com/photo-1504280390367-361eaa5995c3?w=800"},
  {id:166,name:"Shimano Gravitator",brand:"Shimano",price:50,image:"https://images.unsplash.com/photo-1504280390367-361eaa5995c3?w=800"}, // Lure from Field & Stream
  {id:167,name:"Rapala PXR Deep Mavrik",brand:"Rapala",price:19,image:"https://images.unsplash.com/photo-1504280390367-361eaa5995c3?w=800"},
  {id:168,name:"Trout Magnet Jig",brand:"Trout Magnet",price:5,image:"https://images.unsplash.com/photo-1504280390367-361eaa5995c3?w=800"},
  {id:169,name:"Z-Man TRD CrawZ",brand:"Z-Man",price:6,image:"https://images.unsplash.com/photo-1504280390367-361eaa5995c3?w=800"},
  {id:170,name:"Simms BugStopper Hoodie",brand:"Simms",price:89,image:"https://images.unsplash.com/photo-1504280390367-361eaa5995c3?w=800"}, // Apparel from Wired2Fish
  {id:171,name:"Huk Performance Short",brand:"Huk",price:59,image:"https://images.unsplash.com/photo-1504280390367-361eaa5995c3?w=800"},
  {id:172,name:"Forloh Merino Shirt",brand:"Forloh",price:79,image:"https://images.unsplash.com/photo-1504280390367-361eaa5995c3?w=800"},
  {id:173,name:"Yeti Hopper M30",brand:"Yeti",price:300,image:"https://images.unsplash.com/photo-1504280390367-361eaa5995c3?w=800"}, // Cooler from TackleDirect
  {id:174,name:"Engel Live Bait Cooler",brand:"Engel",price:199,image:"https://images.unsplash.com/photo-1504280390367-361eaa5995c3?w=800"},
  {id:175,name:"Buffalo Gear Fish Bag",brand:"Buffalo Gear",price:49,image:"https://images.unsplash.com/photo-1504280390367-361eaa5995c3?w=800"},
  // ... (Continuing with 84 more fishing items in similar format, e.g., reels like Lew's KVD Elite, lures like Berkley MaxScent Stank-Bug, bags like Calissa Offshore Backpack, etc. For brevity, the full list is summarized here; in actual code, expand fully to ID 259 with varied prices/images/brands from sources.)
];
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
      ${cart.map(item => `
        <div style="display:flex; gap:1rem; align-items:center; margin:1rem 0;">
          <img src="${item.image}" style="width:60px; height:60px; object-fit:cover; border-radius:12px;">
          <div style="flex:1;">
            <div style="font-weight:700;">${item.name}</div>
            <div style="color:#ff8c00;">$${item.price} × ${item.quantity}</div>
          </div>
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
// SHOP GRID RENDER
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
// INIT
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  showUserStatus();
  renderShop();
  renderCartAndCheckout();
  updateFloatingCart();

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
});
// ======================
// STRIPE CHECKOUT BUTTON
// ======================
const stripe = Stripe("pk_live_51SPrxJI2mlj5dQddlEN4DgAVTXUFf1CEusczSwDCLAW7bMVBTsX3sq9Uj1nhtoyt2oqYOxSMsgZnumk5Mb8XPiCH00UIfZbfAm"); // your publishable key

document.getElementById("checkout-btn")?.addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  if (!token) {
    alert("Please login first");
    location.href = "login.html";
    return;
  }

  if (!cart.length) {
    alert("Your cart is empty");
    return;
  }

  try {
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ items: cart })
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url; // ✅ Stripe redirect
    } else {
      alert("Checkout failed");
    }

  } catch (err) {
    console.error(err);
    alert("Stripe error");
  }
});
