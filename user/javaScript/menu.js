// ─────────────────────────────────────────────
//  javaScript/menu.js
//  WHY: Fetches products from the API and renders
//       them dynamically, with a category filter
//       driven by the categories collection.
//
//  Flow:
//    1. Fetch GET /api/categories  → build the filter chips
//    2. Fetch GET /api/products    → render every product
//    3. Click a chip              → re-fetch with ?category=<name>
//    4. "Add to Cart"             → redirect to login if not logged in
//                                 → POST /api/cart if logged in
// ─────────────────────────────────────────────

const grid    = document.getElementById("menuGrid");
const filterBar = document.getElementById("categoryFilter");

// "All" is the absence of a filter rather than a real category name
const ALL = "__all__";

let selectedCategory = ALL;
let categories = [];

// ── Filter chips ──────────────────────────────────────────────────────
// One "All" chip plus one chip per category in the database.
function renderFilter() {
  if (!filterBar) return;

  const chips = [
    { name: ALL, label: "All", count: null },
    ...categories.map(c => ({ name: c.name, label: c.name, count: c.productCount })),
  ];

  filterBar.innerHTML = chips.map(c => `
    <button class="filter-chip ${c.name === selectedCategory ? "active" : ""}"
            data-category="${c.name}">
      ${c.label}
      ${c.count !== null && c.count !== undefined ? `<span class="count">${c.count}</span>` : ""}
    </button>
  `).join("");

  filterBar.querySelectorAll(".filter-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedCategory = btn.getAttribute("data-category");
      renderFilter();
      loadMenu();
    });
  });
}

// ── Load the category list for the filter ────────────────────────────
async function loadCategories() {
  if (!filterBar) return;

  try {
    const res = await fetch(`${API_URL}/categories`);
    if (!res.ok) throw new Error("Category list unavailable");

    categories = await res.json();
    renderFilter();

  } catch {
    // No chips — the menu still works, just without the filter
    filterBar.style.display = "none";
  }
}

// ── Fetch and render products ─────────────────────────────────────────
async function loadMenu() {
  showLoading();

  try {
    // Only ask the backend to filter when a real category is picked
    const url = selectedCategory === ALL
      ? `${API_URL}/products`
      : `${API_URL}/products?category=${encodeURIComponent(selectedCategory)}`;

    const res      = await fetch(url);
    const products = await res.json();

    if (!res.ok) throw new Error("Could not load the menu");

    renderProducts(products);

  } catch (err) {
    grid.innerHTML = `
      <div class="menu-empty">
        <span class="icon">🍽️</span>
        <strong>Could not load the menu</strong>
        Make sure the server is running.<br /><small>${err.message}</small>
      </div>`;
  }
}

// ── Render the cards ──────────────────────────────────────────────────
function renderProducts(products) {
  if (!products || products.length === 0) {
    const label = selectedCategory === ALL
      ? "nothing on the menu right now"
      : `nothing in ${selectedCategory} yet`;

    grid.innerHTML = `
      <div class="menu-empty">
        <span class="icon">🍕</span>
        <strong>No dishes found</strong>
        We have ${label}.<br />Please check back soon.
      </div>`;
    return;
  }

  grid.innerHTML = products.map(p => `
    <div class="menu-card ${p.isPopular ? "popular" : ""}">
      ${p.isPopular ? '<span class="tag">POPULAR</span>' : ""}
      <img src="${productImage(p.image)}" alt="${p.name}"
           onerror="this.src=productImageFallback()">
      <span class="card-cat">${p.category || "menu"}</span>
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p class="price">&#8377;${p.price}</p>
      <button class="add-to-cart" onclick="handleAddToCart('${p._id}', '${p.name}', ${p.price})">
        Add to Cart
      </button>
    </div>
  `).join("");
}

function showLoading() {
  grid.innerHTML = `<p class="menu-loading">Loading menu...</p>`;
}

// ── Handle Add to Cart click ──────────────────────────────────────────
async function handleAddToCart(productId, name, price) {
  // If user is NOT logged in, redirect to login page
  if (!isLoggedIn()) {
    alert("Please login to add items to cart.");
    window.location.href = "login.html";
    return;
  }

  try {
    const res  = await fetch(`${API_URL}/cart`, {
      method:  "POST",
      headers: authHeaders(),
      body:    JSON.stringify({ productId, qty: 1 }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Error: " + data.message);
      return;
    }

    // Update the cart badge count in the navbar
    updateCartBadge();

    // Brief visual feedback on the button
    const buttons = document.querySelectorAll(".add-to-cart");
    buttons.forEach(btn => {
      if (btn.getAttribute("onclick").includes(productId)) {
        const original      = btn.textContent;
        btn.textContent     = "Added!";
        btn.classList.add("added");
        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove("added");
        }, 1200);
      }
    });

  } catch (err) {
    alert("Network error. Is the server running?");
  }
}

// ── Update navbar cart badge ──────────────────────────────────────────
async function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (!badge) return;

  if (!isLoggedIn()) {
    badge.textContent = "";
    return;
  }

  try {
    const res  = await fetch(`${API_URL}/cart`, { headers: authHeaders() });
    const data = await res.json();
    const count = data.items ? data.items.reduce((s, i) => s + i.qty, 0) : 0;
    badge.textContent = count > 0 ? count : "";
  } catch {
    badge.textContent = "";
  }
}

// Start loading
loadCategories();
loadMenu();