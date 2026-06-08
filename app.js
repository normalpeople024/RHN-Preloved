/* ═══════════════════════════════════════════════════════
   RHN PRELOVED — app.js
   Auth · Marketplace · Cart · Seller Dashboard · Profile
   Reviews · Orders
═══════════════════════════════════════════════════════ */

/* ── STORAGE KEYS ─────────────────────────────────────── */
const K = {
  users: "rhn_users",
  products: "rhn_products",
  cart: "rhn_cart",
  orders: "rhn_orders",
  reviews: "rhn_reviews",
  user: "rhn_current_user",
};

/* ── STORAGE HELPERS ──────────────────────────────────── */
const store = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (e) {}
};
const load = (k, d) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : d;
  } catch (e) {
    return d;
  }
};

const getUser = () => load(K.user, null);
const setUser = (u) => store(K.user, u);
const clearUser = () => localStorage.removeItem(K.user);
const getUsers = () => load(K.users, []);
const saveUsers = (us) => store(K.users, us);
const getProducts = () => load(K.products, []);
const setProducts = (ps) => store(K.products, ps);
const getCart = () => load(K.cart, []);
const setCart = (c) => store(K.cart, c);
const getOrders = () => load(K.orders, []);
const getReviews = () => load(K.reviews, []);
const saveReview = (r) => {
  const rs = getReviews();
  rs.push(r);
  store(K.reviews, rs);
};

/* ── FORMAT ───────────────────────────────────────────── */
const formatRp = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

/* ── TOAST ────────────────────────────────────────────── */
function toast(msg, type = "info") {
  let c = document.getElementById("toast-container");
  if (!c) {
    c = document.createElement("div");
    c.id = "toast-container";
    document.body.appendChild(c);
  }
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => {
    el.classList.add("out");
    el.addEventListener("animationend", () => el.remove());
  }, 3200);
}

/* ── AUTH GUARD ───────────────────────────────────────── */
function requireAuth() {
  if (!getUser()) window.location.href = "index.html";
}

/* ── NAV RENDER ───────────────────────────────────────── */
function renderNav() {
  const user = getUser();
  const cart = getCart();
  const count = cart.length;
  const root = document.getElementById("nav-root");
  if (!root) return;

  const path = location.pathname.split("/").pop() || "home.html";

  root.innerHTML = `
    <div class="nav-wrap">
      <nav class="nav container">
        <a class="brand" href="home.html">
          <span style="color:var(--accent)">RHN</span>&nbsp;<span class="brand-badge">Preloved</span>
        </a>
        <div class="nav-center">
          <a class="nav-link ${path === "home.html" ? "active" : ""}" href="home.html">Marketplace</a>
          <a class="nav-link ${path === "seller.html" ? "active" : ""}" href="seller.html">Jual Barang</a>
          <a class="nav-link ${path === "profile.html" ? "active" : ""}" href="profile.html">Akun Saya</a>
        </div>
        <div class="nav-right">
          <a class="cart-btn" href="cart.html">
            🛒 <span class="cart-badge" id="cart-count">${count > 0 ? count : ""}</span>
          </a>
          ${
            user
              ? `
            <a class="user-chip" href="profile.html">
              <span style="width:24px;height:24px;border-radius:50%;background:var(--accent);color:#fff;font-size:.7rem;font-weight:800;display:grid;place-items:center;flex-shrink:0">
                ${user.name.charAt(0).toUpperCase()}
              </span>
              ${user.name.split(" ")[0]}
            </a>
          `
              : `<a class="btn-primary btn-sm" href="index.html">Masuk</a>`
          }
        </div>
        <button class="hamburger" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </nav>
      <div class="mobile-menu" id="mobile-menu">
        <a class="nav-link" href="home.html">🛍 Marketplace</a>
        <a class="nav-link" href="seller.html">📦 Jual Barang</a>
        <a class="nav-link" href="cart.html">🛒 Keranjang ${count > 0 ? `(${count})` : ""}</a>
        <a class="nav-link" href="profile.html">👤 Akun Saya</a>
      </div>
    </div>
  `;

  // Hamburger
  root.querySelector(".hamburger").addEventListener("click", () => {
    root.querySelector(".mobile-menu").classList.toggle("open");
  });

  // Role chip
  const chip = document.getElementById("role-chip");
  if (chip && user) {
    chip.innerHTML = `<span class="chip">👤 ${user.name}</span><span class="chip">@${user.username}</span>`;
  }
}

/* ── AUTH SETUP (index.html) ──────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  setupAuth();
  // Only run page-specific inits if called by page scripts
});

function setupAuth() {
  const loginForm = document.getElementById("login-form");
  const regForm = document.getElementById("register-form");
  if (!loginForm && !regForm) return;

  // LOGIN
  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email")?.value.trim();
    const password = document.getElementById("login-password")?.value.trim();
    const msg = document.getElementById("auth-message");

    const users = getUsers();
    const found = users.find(
      (u) => u.email === email && u.password === password,
    );
    if (!found) {
      showAuthMsg("❌ Email atau password salah.", "error");
      return;
    }
    setUser(found);
    showAuthMsg("✓ Berhasil masuk! Mengalihkan…", "success");
    setTimeout(() => (window.location.href = "home.html"), 800);
  });

  // REGISTER
  regForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("reg-name")?.value.trim();
    const username = document
      .getElementById("reg-username")
      ?.value.trim()
      .replace(/^@/, "");
    const email = document.getElementById("reg-email")?.value.trim();
    const phone = document.getElementById("reg-phone")?.value.trim();
    const password = document.getElementById("reg-password")?.value.trim();
    const ktmFile = document.getElementById("reg-ktm")?.files[0];

    if (!name || !username || !email || !phone || !password) {
      showAuthMsg("⚠ Isi semua kolom yang wajib.", "error");
      return;
    }
    if (!ktmFile) {
      showAuthMsg("⚠ Upload foto KTM kamu terlebih dahulu.", "error");
      return;
    }
    if (password.length < 6) {
      showAuthMsg("⚠ Password minimal 6 karakter.", "error");
      return;
    }

    const users = getUsers();
    if (users.find((u) => u.email === email)) {
      showAuthMsg("⚠ Email sudah terdaftar.", "error");
      return;
    }
    if (users.find((u) => u.username === username)) {
      showAuthMsg("⚠ Username sudah dipakai.", "error");
      return;
    }

    // Store KTM as data URL
    const reader = new FileReader();
    reader.onload = (ev) => {
      const newUser = {
        id: `user-${Date.now()}`,
        name,
        username,
        email,
        phone,
        password,
        ktm: ev.target.result,
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      saveUsers(users);
      setUser(newUser);
      showAuthMsg(
        `✓ Akun berhasil dibuat. Selamat datang, ${name}!`,
        "success",
      );
      setTimeout(() => (window.location.href = "home.html"), 900);
    };
    reader.readAsDataURL(ktmFile);
  });
}

function showAuthMsg(msg, type) {
  const el = document.getElementById("auth-message");
  if (!el) return;
  el.className = `auth-message ${type}`;
  el.textContent = msg;
}

/* ── MARKETPLACE ──────────────────────────────────────── */
function renderMarketplace() {
  const grid = document.getElementById("productGrid");
  const searchEl = document.getElementById("searchInput");
  const catEl = document.getElementById("categoryFilter");
  const priceEl = document.getElementById("priceFilter");
  const condEl = document.getElementById("conditionFilter");
  const labelEl = document.getElementById("resultsLabel");
  const resetBtn = document.getElementById("resetFilters");
  if (!grid) return;

  const products = getProducts();

  // Populate categories
  const cats = [...new Set(products.map((p) => p.category))].filter(Boolean);
  catEl.innerHTML =
    `<option value="All">Semua Kategori</option>` +
    cats.map((c) => `<option value="${c}">${c}</option>`).join("");

  function render() {
    const term = searchEl.value.toLowerCase();
    const cat = catEl.value;
    const cond = condEl.value;
    const price = priceEl.value;
    const user = getUser();

    const filtered = products.filter((p) => {
      if (!p.active) return false;
      const mt =
        p.name.toLowerCase().includes(term) ||
        (p.sellerName || "").toLowerCase().includes(term);
      const mc = cat === "All" || p.category === cat;
      const mo = cond === "All" || p.condition === cond;
      const mp =
        price === "low"
          ? p.price <= 100000
          : price === "mid"
            ? p.price > 100000 && p.price <= 500000
            : price === "high"
              ? p.price > 500000
              : true;
      return mt && mc && mo && mp;
    });

    labelEl.textContent = `${filtered.length} produk`;

    if (!filtered.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">${term || cat !== "All" || cond !== "All" || price !== "All" ? "🔍" : "📦"}</div>
          <h3>${term || cat !== "All" ? "Produk tidak ditemukan" : "Belum ada produk"}</h3>
          <p>${term || cat !== "All" ? "Coba ubah filter atau kata kunci." : "Jadilah yang pertama menjual barang!"}</p>
          ${!term && cat === "All" ? `<a href="seller.html" class="btn-primary" style="margin-top:1rem;display:inline-flex">+ Jual Produk</a>` : ""}
        </div>`;
      return;
    }

    grid.innerHTML = filtered
      .map((p, i) => {
        const inCart = getCart().some((c) => c.id === p.id);
        const isSold = p.sold;
        const reviews = getReviewsForProduct(p.id);
        const avg = reviews.length
          ? (
              reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
            ).toFixed(1)
          : null;

        return `
        <article class="product-card" style="animation-delay:${i * 0.05}s" onclick="window.location.href='product.html?id=${p.id}'">
          <div class="thumb-wrap">
            <img class="product-thumb"
              src="${p.images?.[0] || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&q=60"}"
              alt="${p.name}" loading="lazy" />
            <div class="thumb-badge">
              <span class="badge badge-cat">${p.category}</span>
            </div>
            ${isSold ? `<div class="sold-overlay">TERJUAL</div>` : ""}
          </div>
          <div class="product-body">
            <div class="product-name">${p.name}</div>
            <div class="product-price">${formatRp(p.price)} ${p.negotiable ? '<span style="font-size:.68rem;color:var(--yellow);font-family:Sora,sans-serif;font-weight:600">· Nego</span>' : ""}</div>
            <div style="display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;margin-top:.15rem">
              <span class="badge badge-cond" style="font-size:.65rem">${p.condition}</span>
              ${avg ? `<span style="font-size:.72rem;color:var(--yellow)">⭐ ${avg}</span>` : ""}
            </div>
            <div class="product-seller">📍 ${p.location || "Yogyakarta"} · ${p.sellerName}</div>
            ${
              !isSold
                ? `
              <div class="product-footer" onclick="event.stopPropagation()">
                <a class="btn-primary" href="product.html?id=${p.id}" style="font-size:.75rem;padding:.4rem .75rem">Lihat Detail</a>
                <button class="btn-ghost btn-icon" onclick="addToCart('${p.id}')" title="${inCart ? "Sudah di keranjang" : "Tambah ke keranjang"}"
                  style="${inCart ? "color:var(--accent);border-color:var(--accent)" : ""}">
                  ${inCart ? "🛒✓" : "🛒"}
                </button>
              </div>
            `
                : `<div style="margin-top:.5rem"><span class="badge" style="background:var(--red-lo);color:var(--red)">Sudah Terjual</span></div>`
            }
          </div>
        </article>`;
      })
      .join("");
  }

  [searchEl, catEl, priceEl, condEl].forEach((el) =>
    el?.addEventListener("input", render),
  );
  resetBtn?.addEventListener("click", () => {
    searchEl.value = "";
    catEl.value = "All";
    priceEl.value = "All";
    condEl.value = "All";
    render();
  });

  render();
}

/* ── CART ─────────────────────────────────────────────── */
function addToCart(productId) {
  const user = getUser();
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const cart = getCart();
  if (cart.some((i) => i.id === productId)) {
    toast("Produk sudah ada di keranjang.", "info");
    return;
  }
  const product = getProducts().find((p) => p.id === productId);
  if (!product || product.sold) {
    toast("Produk tidak tersedia.", "error");
    return;
  }

  cart.push({ ...product, quantity: 1 });
  setCart(cart);
  document.querySelectorAll("#cart-count").forEach((el) => {
    el.textContent = cart.length > 0 ? cart.length : "";
  });
  toast(`✓ ${product.name} ditambahkan ke keranjang.`, "success");
}
window.addToCart = addToCart;

function removeFromCart(productId) {
  setCart(getCart().filter((i) => i.id !== productId));
  renderCartPage();
  const c = getCart().length;
  document
    .querySelectorAll("#cart-count")
    .forEach((el) => (el.textContent = c > 0 ? c : ""));
  toast("Produk dihapus dari keranjang.", "info");
}
window.removeFromCart = removeFromCart;

/* ── CART PAGE ────────────────────────────────────────── */
function renderCartPage() {
  const cartArea = document.getElementById("cartItems");
  const summaryEl = document.getElementById("cartSummary");
  const buyBtn = document.getElementById("buyNowBtn");
  if (!cartArea) return;

  const cart = getCart();

  if (!cart.length) {
    cartArea.innerHTML = `
      <div class="empty-state" style="padding:3rem 1rem">
        <div class="empty-icon">🛒</div>
        <h3>Keranjang Kosong</h3>
        <p style="margin-bottom:1.25rem">Belum ada produk yang ditambahkan.</p>
        <a class="btn-primary" href="home.html">Jelajahi Produk</a>
      </div>`;
    summaryEl.innerHTML = `<p class="faint" style="text-align:center;padding:.75rem">Tidak ada produk.</p>`;
    if (buyBtn) {
      buyBtn.disabled = true;
      buyBtn.style.opacity = ".4";
    }
    return;
  }

  cartArea.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item-card">
      <img class="cart-thumb"
        src="${item.images?.[0] || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&q=60"}"
        alt="${item.name}" />
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">${item.category} · ${item.condition} · ${item.sellerName}</div>
        <div class="cart-item-price">${formatRp(item.price)}</div>
      </div>
      <div>
        <button class="btn-danger btn-sm" onclick="removeFromCart('${item.id}')">Hapus</button>
      </div>
    </div>`,
    )
    .join("");

  const total = cart.reduce((s, i) => s + i.price, 0);
  summaryEl.innerHTML =
    cart
      .map(
        (i) => `
    <div class="summary-line">
      <span style="max-width:18ch;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${i.name}</span>
      <span>${formatRp(i.price)}</span>
    </div>`,
      )
      .join("") +
    `
    <div class="summary-line"><span>Biaya Layanan</span><span>Rp 0</span></div>
    <div class="summary-total"><span>Total</span><span class="price">${formatRp(total)}</span></div>`;

  if (buyBtn) {
    buyBtn.disabled = false;
    buyBtn.style.opacity = "1";
  }

  // Checkout - replace button to avoid duplicate listeners
  if (buyBtn) {
    const nb = buyBtn.cloneNode(true);
    buyBtn.parentNode.replaceChild(nb, buyBtn);
    nb.addEventListener("click", () => {
      const payment = document.getElementById("checkoutPayment").value;
      const msgEl = document.getElementById("checkoutMessage");
      if (!payment) {
        msgEl.textContent = "Pilih metode pembayaran terlebih dahulu.";
        msgEl.className = "checkout-message error";
        return;
      }
      const user = getUser();
      const order = {
        id: `ORD-${Date.now()}`,
        items: cart.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          sellerId: i.sellerId,
          sellerName: i.sellerName,
          image: i.images?.[0],
        })),
        total,
        payment,
        buyerId: user.id,
        buyerName: user.name,
        status: "pending",
        createdAt: new Date().toISOString(),
        reviewed: false,
      };
      const orders = getOrders();
      orders.unshift(order);
      store(K.orders, orders);
      setCart([]);
      document
        .querySelectorAll("#cart-count")
        .forEach((el) => (el.textContent = ""));

      msgEl.innerHTML = `✅ Pesanan dikonfirmasi! Hubungi penjual untuk deal. #${order.id.slice(-8)}`;
      msgEl.className = "checkout-message success";
      toast(
        "Pesanan berhasil! Segera hubungi penjual via WhatsApp.",
        "success",
      );
      setTimeout(() => renderCartPage(), 200);
    });
  }
}

/* ── PRODUCT DETAIL ───────────────────────────────────── */
function renderProductDetail() {
  const root = document.getElementById("productDetailRoot");
  if (!root) return;

  const id = new URLSearchParams(location.search).get("id");
  const product = getProducts().find((p) => p.id === id);
  const user = getUser();

  if (!product) {
    root.innerHTML = `<div class="card"><p class="muted">Produk tidak ditemukan. <a href="home.html" style="color:var(--accent)">Kembali ke marketplace</a></p></div>`;
    return;
  }

  document.title = `${product.name} | RHN Preloved`;
  const imgs = product.images?.length
    ? product.images
    : [
        "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=900&q=80",
      ];
  const reviews = getReviewsForProduct(id);
  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  root.innerHTML = `
    <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:1.25rem;flex-wrap:wrap">
      <a href="home.html" class="btn-ghost btn-sm">← Kembali</a>
      <span class="faint">/</span>
      <span class="faint">${product.category}</span>
      <span class="faint">/</span>
      <span class="faint" style="max-width:24ch;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${product.name}</span>
    </div>

    <div class="detail-layout">
      <!-- Gallery -->
      <div>
        <div class="gallery-main">
          <img id="main-img" src="${imgs[0]}" alt="${product.name}" />
        </div>
        ${
          imgs.length > 1
            ? `<div class="gallery-thumbs" id="gallery-thumbs">
          ${imgs.map((img, i) => `<img src="${img}" alt="thumb" class="${i === 0 ? "active" : ""}" onclick="switchImg('${img}', this)" />`).join("")}
        </div>`
            : ""
        }
      </div>

      <!-- Info -->
      <div class="detail-info">
        <div>
          <p class="eyebrow">${product.category}</p>
          <h1 style="font-size:clamp(1.3rem,2.5vw,1.75rem);margin-block:.4rem .6rem">${product.name}</h1>
          <div class="detail-price">${formatRp(product.price)}</div>
        </div>

        <div class="detail-tags">
          <span class="badge badge-cond">${product.condition}</span>
          ${product.negotiable ? `<span class="badge badge-neg">💬 Bisa Nego</span>` : `<span class="badge" style="background:var(--bg-input);color:var(--ink-faint);border:1px solid var(--border)">Harga Tetap</span>`}
          ${avg ? `<span class="badge" style="background:var(--yellow-lo);color:var(--yellow);border:1px solid rgba(234,179,8,.2)">⭐ ${avg} (${reviews.length})</span>` : ""}
        </div>

        <p style="color:var(--ink-mid);line-height:1.75;font-size:.9rem">${product.description}</p>

        ${
          product.advantages || product.disadvantages
            ? `
          <div class="detail-section">
            <h4>Kelebihan & Kekurangan</h4>
            <div class="pros-cons">
              <div class="pros-box"><strong>✅ Kelebihan</strong>${product.advantages || "-"}</div>
              <div class="cons-box"><strong>⚠ Kekurangan</strong>${product.disadvantages || "-"}</div>
            </div>
          </div>`
            : ""
        }

        <div class="detail-section">
          <h4>Metode Pembayaran</h4>
          <div class="payment-chips">
            ${(product.paymentMethods || []).map((m) => `<span class="payment-chip">${m}</span>`).join("")}
          </div>
        </div>

        ${
          product.location
            ? `
          <div class="detail-section">
            <h4>Lokasi COD</h4>
            <p style="font-size:.88rem;color:var(--ink-mid)">📍 ${product.location}</p>
          </div>`
            : ""
        }

        <div class="detail-section">
          <h4>Informasi Penjual</h4>
          <div class="seller-card">
            <div class="seller-row">
              <div class="seller-avatar">${(product.sellerName || "?").charAt(0).toUpperCase()}</div>
              <div>
                <div class="seller-name">${product.sellerName}</div>
                <div class="seller-sub">@${product.sellerUsername || ""} · Penjual Terverifikasi</div>
              </div>
            </div>
            <div class="seller-contacts">
              <div class="contact-row">📱 ${product.phone}</div>
              <div class="contact-row">💬 WA: ${product.whatsapp}</div>
            </div>
          </div>
        </div>

        ${
          !product.sold
            ? `
          <div style="display:flex;gap:.65rem;flex-wrap:wrap">
            <button class="btn-primary" style="flex:1" onclick="addToCart('${product.id}')">🛒 Tambah ke Keranjang</button>
            <a class="btn-ghost" href="cart.html">Lihat Keranjang</a>
          </div>
          <a href="https://wa.me/${waNumber(product.whatsapp)}?text=${encodeURIComponent("Halo, saya tertarik dengan produk: " + product.name + " (Rp" + product.price + "). Apakah masih tersedia?")}"
            target="_blank" class="btn-outline btn-full" style="text-align:center">
            💬 Hubungi Penjual via WhatsApp
          </a>
        `
            : `<div class="card" style="text-align:center;padding:1.5rem"><span style="color:var(--red);font-weight:700">Produk ini sudah terjual</span></div>`
        }
      </div>
    </div>

    <!-- Reviews Section -->
    <div class="reviews-section" style="margin-top:2rem">
      <div class="card">
        <h2 style="font-size:1.05rem;margin-bottom:1.1rem">Ulasan Pembeli ${reviews.length ? `<span style="color:var(--ink-faint);font-size:.82rem;font-weight:400">(${reviews.length} ulasan)</span>` : ""}</h2>
        ${
          reviews.length
            ? reviews
                .map(
                  (r) => `
          <div class="review-card">
            <div class="review-header">
              <div>
                <span style="font-weight:600;font-size:.85rem">${r.buyerName}</span>
                <div class="review-stars">${"⭐".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
              </div>
              <span class="review-author">${new Date(r.createdAt).toLocaleDateString("id-ID")}</span>
            </div>
            <p class="review-text">${r.text}</p>
          </div>`,
                )
                .join("")
            : `<p class="faint" style="text-align:center;padding:1rem">Belum ada ulasan untuk produk ini.</p>`
        }
      </div>
    </div>
  `;
}

window.switchImg = function (src, el) {
  document.getElementById("main-img").src = src;
  document
    .querySelectorAll("#gallery-thumbs img")
    .forEach((i) => i.classList.remove("active"));
  el.classList.add("active");
};

function waNumber(phone) {
  const clean = (phone || "").replace(/\D/g, "");
  return clean.startsWith("0") ? "62" + clean.slice(1) : clean;
}

function getReviewsForProduct(productId) {
  return getReviews().filter((r) => r.productId === productId);
}

/* ── SELLER DASHBOARD ─────────────────────────────────── */
function renderSellerDashboard() {
  const statsEl = document.getElementById("dashStats");
  const listingsEl = document.getElementById("sellerListings");
  const modal = document.getElementById("productModal");
  const form = document.getElementById("productForm");
  if (!listingsEl) return;

  const user = getUser();

  // Image preview
  document
    .getElementById("productImages")
    ?.addEventListener("change", function () {
      const box = document.getElementById("previewBox");
      if (!box) return;
      box.innerHTML = "";
      [...this.files].slice(0, 4).forEach((f) => {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(f);
        box.appendChild(img);
      });
    });

  // Fee proof filename
  document
    .getElementById("prod-fee-proof")
    ?.addEventListener("change", function () {
      document.getElementById("fee-filename").textContent =
        this.files[0]?.name || "";
    });

  // Open/close modal
  document.getElementById("openAddModal")?.addEventListener("click", () => {
    window.__editId = null;
    document.getElementById("modalTitle").textContent = "Upload Produk Baru";
    form?.reset();
    document.getElementById("previewBox").innerHTML = "";
    document.getElementById("fee-filename").textContent = "";
    openModal();
  });
  document.getElementById("closeModal")?.addEventListener("click", closeModal);
  document.getElementById("cancelModal")?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Save product
  document.getElementById("saveProduct")?.addEventListener("click", () => {
    const editId = window.__editId || null;
    const methods = [...document.querySelectorAll(".pay-method:checked")].map(
      (i) => i.value,
    );
    const name = document.getElementById("prod-name")?.value.trim();
    const cat = document.getElementById("prod-category")?.value;
    const cond = document.getElementById("prod-condition")?.value;
    const desc = document.getElementById("prod-description")?.value.trim();
    const loc = document.getElementById("prod-location")?.value.trim();
    const price = Number(document.getElementById("prod-price")?.value);
    const nego = document.getElementById("prod-negotiable")?.checked;
    const adv = document.getElementById("prod-advantages")?.value.trim();
    const dis = document.getElementById("prod-disadvantages")?.value.trim();
    const feeFile = document.getElementById("prod-fee-proof")?.files[0];

    if (!name || !cat || !cond || !desc || !loc || !price) {
      toast(
        "Lengkapi semua kolom wajib (nama, kategori, kondisi, deskripsi, lokasi, harga).",
        "error",
      );
      return;
    }
    if (!methods.length) {
      toast("Pilih minimal 1 metode pembayaran.", "error");
      return;
    }
    if (!feeFile && !editId) {
      toast("Upload bukti pembayaran fee Rp 5.000.", "error");
      return;
    }

    const files = [
      ...(document.getElementById("productImages")?.files || []),
    ].slice(0, 4);

    function buildProduct(images) {
      return {
        id: editId || `prod-${Date.now()}`,
        name,
        category: cat,
        condition: cond,
        description: desc,
        advantages: adv,
        disadvantages: dis,
        location: loc,
        price,
        negotiable: nego,
        paymentMethods: methods,
        sellerId: user.id,
        sellerName: user.name,
        sellerUsername: user.username,
        phone: user.phone,
        whatsapp: user.phone,
        images,
        active: true,
        sold: false,
        createdAt: new Date().toISOString(),
        feeProof: true,
      };
    }

    if (files.length) {
      const readers = files.map(
        (f) =>
          new Promise((res) => {
            const r = new FileReader();
            r.onload = (e) => res(e.target.result);
            r.readAsDataURL(f);
          }),
      );
      Promise.all(readers).then((images) => {
        saveProd(buildProduct(images), editId);
      });
    } else {
      const existing = editId
        ? getProducts().find((p) => p.id === editId)?.images || []
        : [];
      saveProd(buildProduct(existing), editId);
    }
  });

  function saveProd(product, editId) {
    const products = getProducts();
    if (editId) {
      const idx = products.findIndex((p) => p.id === editId);
      if (idx >= 0) products.splice(idx, 1, product);
    } else {
      products.unshift(product);
    }
    setProducts(products);
    closeModal();
    renderListings();
    renderStats();
    toast(
      editId ? "✓ Listing diperbarui." : "✓ Listing berhasil ditambahkan!",
      "success",
    );
    window.__editId = null;
  }

  function renderStats() {
    if (!statsEl) return;
    const myProducts = getProducts().filter((p) => p.sellerId === user.id);
    const myProductIds = myProducts.map((p) => p.id);
    const allOrders = getOrders();
    const sold = myProducts.filter((p) => p.sold).length;
    const active = myProducts.filter((p) => !p.sold && p.active).length;
    const totalEarned = myProducts.reduce(
      (s, p) => (p.sold ? s + p.price : s),
      0,
    );
    const pendingCount = allOrders.filter(
      (o) =>
        o.status === "pending" &&
        o.items.some((i) => myProductIds.includes(i.id)),
    ).length;

    statsEl.innerHTML = [
      { value: myProducts.length, label: "Total Listing", icon: "📦" },
      { value: active, label: "Aktif", icon: "🟢" },
      { value: sold, label: "Terjual", icon: "✅" },
      {
        value: pendingCount,
        label: "Pesanan Masuk",
        icon: "🔔",
        highlight: pendingCount > 0,
      },
      { value: formatRp(totalEarned), label: "Est. Pendapatan", icon: "💰" },
    ]
      .map(
        (s) => `
      <div class="stat-card" ${s.highlight ? 'style="border-color:var(--yellow);background:var(--yellow-lo)"' : ""}>
        <div style="font-size:1.4rem;margin-bottom:.35rem">${s.icon}</div>
        <div class="stat-value" ${s.highlight ? 'style="color:var(--yellow)"' : ""}>${s.value}</div>
        <div class="stat-label">${s.label}</div>
      </div>`,
      )
      .join("");
  }

  function renderListings() {
    const myProducts = getProducts().filter((p) => p.sellerId === user.id);
    const allOrders = getOrders();

    if (!myProducts.length) {
      listingsEl.innerHTML = `
        <div class="empty-state" style="padding:2.5rem">
          <div class="empty-icon">📦</div>
          <h3>Belum ada listing</h3>
          <p>Klik tombol "Upload Produk Baru" untuk mulai berjualan.</p>
        </div>`;
      return;
    }

    listingsEl.innerHTML = myProducts
      .map((p) => {
        // Find all pending orders that contain this product
        const incomingOrders = allOrders.filter(
          (o) =>
            o.status === "pending" && o.items.some((item) => item.id === p.id),
        );
        const acceptedOrders = allOrders.filter(
          (o) =>
            o.status === "accepted" && o.items.some((item) => item.id === p.id),
        );

        const pendingBadge = incomingOrders.length
          ? `<span class="badge" style="background:var(--yellow-lo);color:var(--yellow);border:1px solid rgba(234,179,8,.25);animation:pulse 1.5s infinite">🔔 ${incomingOrders.length} pesanan masuk</span>`
          : "";

        const ordersHtml = incomingOrders.length
          ? `
        <div class="incoming-orders">
          <div class="incoming-title">📬 Pesanan Masuk</div>
          ${incomingOrders
            .map((o) => {
              const buyer = getUsers().find((u) => u.id === o.buyerId) || {};
              const waLink = `https://wa.me/${waNumber(buyer.phone || "")}?text=${encodeURIComponent("Halo " + (buyer.name || "") + ', pesananmu untuk produk "' + p.name + '" sudah saya terima! Kapan bisa COD?')}`;
              return `
              <div class="order-row-seller">
                <div class="order-row-info">
                  <div class="order-row-buyer">
                    <span class="buyer-avatar">${(buyer.name || "?").charAt(0).toUpperCase()}</span>
                    <div>
                      <div style="font-weight:600;font-size:.85rem">${buyer.name || "Pembeli"}</div>
                      <div style="font-size:.75rem;color:var(--ink-faint)">@${buyer.username || "-"} · ${new Date(o.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</div>
                    </div>
                  </div>
                  <div style="font-size:.8rem;color:var(--ink-mid)">
                    💳 ${o.payment} · <span class="price-text" style="font-size:.8rem">${formatRp(o.total)}</span>
                  </div>
                </div>
                <div style="display:flex;gap:.4rem;flex-wrap:wrap;align-items:center">
                  <a href="${waLink}" target="_blank" class="btn-outline btn-sm">
                    💬 WA Pembeli
                  </a>
                  <button class="btn-primary btn-sm" onclick="acceptOrder('${o.id}','${p.id}')">
                    ✅ Terima Pesanan
                  </button>
                  <button class="btn-danger btn-sm" onclick="rejectOrder('${o.id}')">
                    ✕ Tolak
                  </button>
                </div>
              </div>`;
            })
            .join("")}
        </div>`
          : "";

        const acceptedHtml = acceptedOrders.length
          ? `
        <div class="incoming-orders" style="border-color:rgba(34,197,94,.2);background:var(--green-lo)">
          <div class="incoming-title" style="color:var(--green)">✅ Pesanan Diterima — Tunggu Konfirmasi Pembeli</div>
          ${acceptedOrders
            .map((o) => {
              const buyer = getUsers().find((u) => u.id === o.buyerId) || {};
              const waLink = `https://wa.me/${waNumber(buyer.phone || "")}?text=${encodeURIComponent("Halo " + (buyer.name || "") + ', pesananmu sudah saya terima! Kapan bisa COD untuk produk "' + p.name + '"?')}`;
              return `
              <div class="order-row-seller" style="border-color:rgba(34,197,94,.15)">
                <div class="order-row-info">
                  <div class="order-row-buyer">
                    <span class="buyer-avatar" style="background:var(--green)">${(buyer.name || "?").charAt(0).toUpperCase()}</span>
                    <div>
                      <div style="font-weight:600;font-size:.85rem">${buyer.name || "Pembeli"}</div>
                      <div style="font-size:.75rem;color:var(--ink-faint)">📱 ${buyer.phone || "-"}</div>
                    </div>
                  </div>
                </div>
                <a href="${waLink}" target="_blank" class="btn-outline btn-sm" style="border-color:var(--green);color:var(--green)">
                  💬 Chat Pembeli
                </a>
              </div>`;
            })
            .join("")}
        </div>`
          : "";

        return `
        <div class="listing-item" id="listing-${p.id}">
          <div class="listing-main">
            <img class="listing-thumb"
              src="${p.images?.[0] || "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100"}"
              alt="${p.name}" />
            <div class="listing-info">
              <div style="display:flex;align-items:flex-start;gap:.5rem;flex-wrap:wrap">
                <div style="font-weight:700;font-size:.95rem;flex:1">${p.name}</div>
                ${pendingBadge}
              </div>
              <div style="display:flex;gap:.4rem;flex-wrap:wrap;align-items:center;margin-top:.35rem">
                <span class="price-text" style="font-size:.95rem">${formatRp(p.price)}</span>
                <span class="badge badge-cond" style="font-size:.65rem">${p.condition}</span>
                <span class="faint" style="font-size:.75rem">${p.category}</span>
              </div>
              <div style="font-size:.75rem;color:var(--ink-faint);margin-top:.2rem">📍 ${p.location || "Yogyakarta"}</div>
            </div>
            <div class="listing-status-col">
              ${
                p.sold
                  ? `<span class="badge" style="background:var(--red-lo);color:var(--red)">Terjual</span>`
                  : `<span class="badge" style="background:var(--green-lo);color:var(--green)">Aktif</span>`
              }
              <div style="display:flex;gap:.35rem;margin-top:.5rem;flex-wrap:wrap">
                <button class="btn-ghost btn-sm" onclick="editListing('${p.id}')">Edit</button>
                ${!p.sold ? `<button class="btn-outline btn-sm" onclick="markSold('${p.id}')">Terjual</button>` : ""}
                <button class="btn-danger btn-sm" onclick="deleteListing('${p.id}')">Hapus</button>
              </div>
            </div>
          </div>
          ${ordersHtml}
          ${acceptedHtml}
        </div>`;
      })
      .join("");
  }

  renderStats();
  renderListings();
}

function openModal() {
  const m = document.getElementById("productModal");
  if (m) {
    m.classList.add("open");
    document.body.classList.add("no-scroll");
  }
}
function closeModal() {
  const m = document.getElementById("productModal");
  if (m) {
    m.classList.remove("open");
    document.body.classList.remove("no-scroll");
  }
}

function editListing(id) {
  const p = getProducts().find((p) => p.id === id);
  if (!p) return;
  window.__editId = id;
  document.getElementById("modalTitle").textContent = "Edit Listing Produk";

  const set = (sel, val) => {
    const el = document.getElementById(sel);
    if (el) el.value = val;
  };
  set("prod-name", p.name);
  set("prod-category", p.category);
  set("prod-condition", p.condition);
  set("prod-description", p.description);
  set("prod-advantages", p.advantages || "");
  set("prod-disadvantages", p.disadvantages || "");
  set("prod-location", p.location || "");
  set("prod-price", p.price);
  document.getElementById("prod-negotiable").checked = p.negotiable;
  document.querySelectorAll(".pay-method").forEach((i) => {
    i.checked = (p.paymentMethods || []).includes(i.value);
  });

  // Show existing images
  const box = document.getElementById("previewBox");
  if (box) {
    box.innerHTML = (p.images || [])
      .map((img) => `<img src="${img}" alt="preview" />`)
      .join("");
  }

  openModal();
}
window.editListing = editListing;

function markSold(id) {
  const products = getProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx < 0) return;
  if (
    !confirm(
      "Tandai produk ini sebagai terjual? Produk akan hilang dari marketplace.",
    )
  )
    return;
  products[idx].sold = true;
  setProducts(products);
  renderSellerDashboard();
  toast("✓ Produk ditandai sebagai terjual.", "success");
}
window.markSold = markSold;

function deleteListing(id) {
  const p = getProducts().find((p) => p.id === id);
  if (!p) return;
  if (
    !confirm(
      `Hapus listing "${p.name}"?\n\nCatatan: Jika Anda membatalkan upload barang, fee Rp 5.000 yang sudah dibayarkan akan dikembalikan 50% (Rp 2.500).`,
    )
  )
    return;
  setProducts(getProducts().filter((p) => p.id !== id));
  renderSellerDashboard();
  toast("Listing dihapus.", "info");
}
window.deleteListing = deleteListing;

function acceptOrder(orderId, productId) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return;
  orders[idx].status = "accepted";
  store(K.orders, orders);
  toast("✅ Pesanan diterima! Segera hubungi pembeli untuk COD.", "success");
  renderSellerDashboard();
}
window.acceptOrder = acceptOrder;

function rejectOrder(orderId) {
  if (!confirm("Tolak pesanan ini? Pembeli akan mendapat notifikasi.")) return;
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return;
  orders[idx].status = "rejected";
  store(K.orders, orders);
  toast("Pesanan ditolak.", "info");
  renderSellerDashboard();
}
window.rejectOrder = rejectOrder;

/* ── PROFILE PAGE ─────────────────────────────────────── */
function renderProfilePage() {
  const user = getUser();
  if (!user) return;

  // Fill profile card
  const a = document.getElementById("profile-avatar");
  const n = document.getElementById("profile-name");
  const u = document.getElementById("profile-username");
  const e = document.getElementById("profile-email");
  const h = document.getElementById("profile-headline");

  if (a) a.textContent = user.name.charAt(0).toUpperCase();
  if (n) n.textContent = user.name;
  if (u) u.textContent = "@" + user.username;
  if (e) e.textContent = user.email;
  if (h) h.textContent = user.name.split(" ")[0];

  // Stats
  const statsEl = document.getElementById("profile-stats");
  if (statsEl) {
    const myProds = getProducts().filter((p) => p.sellerId === user.id);
    const myProductIds = myProds.map((p) => p.id);
    const myOrders = getOrders().filter((o) => o.buyerId === user.id);
    const givenReviews = getReviews().filter((r) => r.buyerId === user.id);
    const rcvdReviews = getReviews().filter((r) =>
      myProductIds.includes(r.productId),
    );
    statsEl.innerHTML = [
      ["📦", myProds.length, "Produk Dijual"],
      ["🛒", myOrders.length, "Pesanan"],
      ["✍️", givenReviews.length, "Ulasan Diberikan"],
      ["⭐", rcvdReviews.length, "Ulasan Diterima"],
    ]
      .map(
        ([icon, val, label]) => `
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:.85rem;padding:.35rem 0;border-bottom:1px solid var(--border)">
        <span style="color:var(--ink-mid)">${icon} ${label}</span>
        <span style="font-weight:700">${val}</span>
      </div>`,
      )
      .join("");
  }

  // Logout
  document.getElementById("logout-btn")?.addEventListener("click", () => {
    clearUser();
    window.location.href = "index.html";
  });

  // Tabs
  const tabOrders = document.getElementById("tab-orders");
  const tabGiven = document.getElementById("tab-reviews-given");
  const tabReceived = document.getElementById("tab-reviews-received");
  const panOrders = document.getElementById("orders-panel");
  const panGiven = document.getElementById("reviews-given-panel");
  const panReceived = document.getElementById("reviews-received-panel");

  function switchTab(activeTab, activePanel) {
    [tabOrders, tabGiven, tabReceived].forEach((t) =>
      t?.classList.remove("active"),
    );
    [panOrders, panGiven, panReceived].forEach((p) =>
      p?.classList.add("hidden"),
    );
    activeTab?.classList.add("active");
    activePanel?.classList.remove("hidden");
  }

  tabOrders?.addEventListener("click", () => switchTab(tabOrders, panOrders));
  tabGiven?.addEventListener("click", () => switchTab(tabGiven, panGiven));
  tabReceived?.addEventListener("click", () =>
    switchTab(tabReceived, panReceived),
  );

  renderOrders();
  renderGivenReviews();
  renderReceivedReviews();
}

function renderOrders() {
  const el = document.getElementById("ordersList");
  if (!el) return;
  const user = getUser();
  const orders = getOrders().filter((o) => o.buyerId === user.id);

  if (!orders.length) {
    el.innerHTML = `
      <div class="empty-state" style="padding:2rem">
        <div class="empty-icon">🛒</div>
        <h3>Belum ada pesanan</h3>
        <p>Mulai belanja dan buat pesanan pertamamu!</p>
        <a href="home.html" class="btn-primary" style="margin-top:1rem;display:inline-flex">Ke Marketplace</a>
      </div>`;
    return;
  }

  el.innerHTML = orders
    .map(
      (order) => `
    <div class="order-card" id="order-${order.id}">
      <div class="order-header">
        <div>
          <div class="order-id">#${order.id}</div>
          <div style="font-size:.78rem;color:var(--ink-faint);margin-top:.2rem">${new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
        </div>
        <span class="order-status ${order.status}">
          ${
            order.status === "pending"
              ? "⏳ Menunggu Penjual"
              : order.status === "accepted"
                ? "✅ Diterima Penjual"
                : order.status === "done"
                  ? "🎉 Selesai"
                  : order.status === "rejected"
                    ? "✕ Ditolak"
                    : order.status
          }
        </span>
      </div>
      <div class="order-items">${order.items.map((i) => i.name).join(", ")}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem">
        <span class="order-total">${formatRp(order.total)}</span>
        <span class="faint">${order.payment}</span>
      </div>
      ${
        order.status === "pending" || order.status === "accepted"
          ? `
        <div style="display:flex;gap:.5rem;margin-top:.85rem;flex-wrap:wrap;align-items:center">
          ${order.status === "pending" ? `<span class="badge" style="background:var(--yellow-lo);color:var(--yellow)">⏳ Menunggu penjual menerima pesanan</span>` : ""}
          ${order.items
            .map(
              (item) => `
            <a href="https://wa.me/${waNumber(getUserPhone(item.sellerId))}?text=${encodeURIComponent('Halo, saya sudah checkout produk "' + item.name + '". Kapan bisa COD?')}"
              target="_blank" class="btn-outline btn-sm">💬 WA Penjual: ${item.sellerName}</a>
          `,
            )
            .join("")}
          ${
            order.status === "accepted"
              ? `
            <button class="btn-primary btn-sm" onclick="confirmDone('${order.id}')">✅ Konfirmasi Transaksi Selesai</button>
          `
              : ""
          }
        </div>
      `
          : ""
      }
      ${
        order.status === "rejected"
          ? `
        <div style="margin-top:.65rem;padding:.65rem .85rem;background:var(--red-lo);border-radius:var(--r-md);font-size:.82rem;color:var(--red)">
          Pesanan ini ditolak oleh penjual. Silakan hubungi penjual atau cari produk lain.
        </div>
      `
          : ""
      }
      ${
        order.status === "done" && !order.reviewed
          ? `
        <div class="review-box" id="review-${order.id}">
          <div style="font-size:.82rem;font-weight:600;margin-bottom:.25rem">Beri ulasan untuk transaksi ini</div>
          <div class="star-row" id="stars-${order.id}">
            ${[1, 2, 3, 4, 5].map((n) => `<button type="button" class="star-btn" data-val="${n}" onclick="setStar('${order.id}', ${n})">☆</button>`).join("")}
          </div>
          <textarea id="review-text-${order.id}" placeholder="Bagaimana pengalaman bertransaksi?" rows="2"
            style="font-size:.85rem"></textarea>
          <button class="btn-primary btn-sm" onclick="submitReview('${order.id}')">Kirim Ulasan</button>
        </div>
      `
          : ""
      }
      ${order.reviewed ? `<div class="faint" style="margin-top:.5rem;font-size:.78rem">✅ Ulasan sudah diberikan</div>` : ""}
    </div>`,
    )
    .join("");
}

function getUserPhone(sellerId) {
  if (!sellerId) return "";
  const users = getUsers();
  return users.find((u) => u.id === sellerId)?.phone || "";
}

function confirmDone(orderId) {
  const orders = getOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx < 0) return;

  // Mark products as sold
  const order = orders[idx];
  const products = getProducts();
  order.items.forEach((item) => {
    const pi = products.findIndex((p) => p.id === item.id);
    if (pi >= 0) products[pi].sold = true;
  });
  setProducts(products);

  orders[idx].status = "done";
  store(K.orders, orders);
  toast(
    "✅ Transaksi dikonfirmasi selesai! Produk otomatis hilang dari marketplace.",
    "success",
  );
  renderOrders();
}
window.confirmDone = confirmDone;

function setStar(orderId, val) {
  window.__stars = window.__stars || {};
  window.__stars[orderId] = val;
  document.querySelectorAll(`#stars-${orderId} .star-btn`).forEach((btn, i) => {
    btn.textContent = i < val ? "⭐" : "☆";
    btn.classList.toggle("active", i < val);
  });
}
window.setStar = setStar;

function submitReview(orderId) {
  const rating = (window.__stars || {})[orderId];
  const text = document.getElementById(`review-text-${orderId}`)?.value.trim();
  if (!rating) {
    toast("Pilih rating bintang terlebih dahulu.", "error");
    return;
  }
  if (!text) {
    toast("Tulis ulasan terlebih dahulu.", "error");
    return;
  }

  const user = getUser();
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return;

  // Save review for each product in order
  order.items.forEach((item) => {
    saveReview({
      id: `rev-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      productId: item.id,
      orderId,
      buyerId: user.id,
      buyerName: user.name,
      rating,
      text,
      createdAt: new Date().toISOString(),
    });
  });

  // Mark order as reviewed
  const idx = orders.findIndex((o) => o.id === orderId);
  orders[idx].reviewed = true;
  store(K.orders, orders);

  toast("⭐ Ulasan berhasil dikirim!", "success");
  renderOrders();
}
window.submitReview = submitReview;

function renderGivenReviews() {
  const el = document.getElementById("reviews-given-list");
  if (!el) return;
  const user = getUser();
  const rs = getReviews().filter((r) => r.buyerId === user.id);

  if (!rs.length) {
    el.innerHTML = `<div class="empty-state" style="padding:2rem"><div class="empty-icon">✍️</div><h3>Belum ada ulasan</h3><p>Ulasan muncul setelah transaksi selesai dan dikonfirmasi.</p></div>`;
    return;
  }

  el.innerHTML = rs
    .map((r) => {
      const prod = getProducts().find((p) => p.id === r.productId);
      return `
      <div class="review-card">
        <div style="display:flex;align-items:center;gap:.65rem;margin-bottom:.5rem">
          ${prod?.images?.[0] ? `<img src="${prod.images[0]}" style="width:40px;height:40px;object-fit:cover;border-radius:var(--r-sm);border:1px solid var(--border)" />` : ""}
          <div>
            <a href="product.html?id=${r.productId}" style="font-weight:600;font-size:.88rem;color:var(--accent)">${prod?.name || "Produk"}</a>
            <div style="font-size:.75rem;color:var(--ink-faint)">Penjual: ${prod?.sellerName || "-"}</div>
          </div>
        </div>
        <div class="review-header">
          <div class="review-stars">${"⭐".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
          <span class="review-author">${new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
        <p class="review-text" style="margin-top:.4rem">${r.text}</p>
      </div>`;
    })
    .join("");
}

function renderReceivedReviews() {
  const el = document.getElementById("reviews-received-list");
  if (!el) return;
  const user = getUser();

  // Reviews on products that belong to me
  const myProductIds = getProducts()
    .filter((p) => p.sellerId === user.id)
    .map((p) => p.id);
  const rs = getReviews().filter((r) => myProductIds.includes(r.productId));

  if (!rs.length) {
    el.innerHTML = `<div class="empty-state" style="padding:2rem"><div class="empty-icon">⭐</div><h3>Belum ada ulasan</h3><p>Ulasan dari pembeli akan muncul di sini setelah transaksi selesai.</p></div>`;
    return;
  }

  // Group by product
  const byProduct = {};
  rs.forEach((r) => {
    if (!byProduct[r.productId]) byProduct[r.productId] = [];
    byProduct[r.productId].push(r);
  });

  el.innerHTML = Object.entries(byProduct)
    .map(([prodId, reviews]) => {
      const prod = getProducts().find((p) => p.id === prodId);
      const avg = (
        reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      ).toFixed(1);
      return `
      <div style="margin-bottom:1.25rem">
        <div style="display:flex;align-items:center;gap:.65rem;margin-bottom:.65rem;padding-bottom:.65rem;border-bottom:1px solid var(--border)">
          ${prod?.images?.[0] ? `<img src="${prod.images[0]}" style="width:44px;height:44px;object-fit:cover;border-radius:var(--r-sm);border:1px solid var(--border)" />` : ""}
          <div>
            <div style="font-weight:700;font-size:.9rem">${prod?.name || "Produk"}</div>
            <div style="font-size:.75rem;color:var(--yellow)">⭐ ${avg} · ${reviews.length} ulasan</div>
          </div>
        </div>
        ${reviews
          .map(
            (r) => `
          <div class="review-card" style="margin-bottom:.5rem">
            <div class="review-header">
              <div style="display:flex;align-items:center;gap:.5rem">
                <span style="width:26px;height:26px;border-radius:50%;background:var(--accent);color:#fff;font-size:.7rem;font-weight:700;display:grid;place-items:center;flex-shrink:0">${r.buyerName.charAt(0).toUpperCase()}</span>
                <div>
                  <span style="font-weight:600;font-size:.85rem">${r.buyerName}</span>
                  <div class="review-stars" style="font-size:.8rem">${"⭐".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
                </div>
              </div>
              <span class="review-author">${new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
            <p class="review-text" style="margin-top:.4rem">${r.text}</p>
          </div>`,
          )
          .join("")}
      </div>`;
    })
    .join("");
}
