// ─────────────────────────────────────────────
//  javaScript/cart.js
//  WHY: Replaced localStorage cart with API calls.
//       Cart is now stored in MongoDB per user.
//       Requires user to be logged in.
//
//  Empty-cart rule: when the API returns no items we
//  hide the column header, the totals/calculations
//  panel AND the checkout button, so there is nothing
//  clickable on a cart that has nothing in it.
// ─────────────────────────────────────────────

const cartItemsBox = document.getElementById("cartItems");
const cartHeader   = document.getElementById("cartHeader");
const cartSummary  = document.getElementById("cartSummary");
const subTotalEl   = document.getElementById("subTotal");
const taxEl        = document.getElementById("tax");
const grandTotalEl = document.getElementById("grandTotal");

const TAX_RATE = 0.09;
const money = (n) => "₹" + n;

// ── Show/hide the parts that only make sense with items ───────────────
// Uses a class rather than an inline style, so the responsive
// rules in cart.css keep working on small screens.
function setCartState(isEmpty) {
  if (cartHeader)  cartHeader.classList.toggle("is-hidden", isEmpty);
  if (cartSummary) cartSummary.classList.toggle("is-hidden", isEmpty);
}

// Render the "nothing here yet" panel inside #cartItems
function renderEmptyState() {
  setCartState(true);

  subTotalEl.innerText   = money(0);
  taxEl.innerText        = money(0);
  grandTotalEl.innerText = money(0);

  cartItemsBox.innerHTML = `
    <div class="cart-empty">
      <span class="icon">🛒</span>
      <strong>Your cart is empty</strong>
      <p>You haven't added anything yet. Pick something delicious.</p>
      <a href="menu.html">Browse the menu</a>
    </div>`;
}

function renderError(message) {
  cartItemsBox.innerHTML = `
    <div class="cart-msg error">
      ${message}<br /><small>Is the server running?</small>
    </div>`;
}

// ── Fetch and render cart ─────────────────────────────────────────────
async function renderCart() {
  cartItemsBox.innerHTML = `<p class="cart-msg">Loading cart...</p>`;

  try {
    const res  = await fetch(`${API_URL}/cart`, { headers: authHeaders() });
    const data = await res.json();

    if (!res.ok) {
      renderError(data.message || "Could not load your cart.");
      setCartState(true);
      return;
    }

    const { items, subtotal } = data;

    // ── Validation: nothing in the cart ──
    if (!items || items.length === 0) {
      renderEmptyState();
      return;
    }

    // ── Validation: guard against a non-numeric subtotal ──
    const base = Number(subtotal) || 0;
    if (base <= 0) {
      renderEmptyState();
      return;
    }

    setCartState(false);

    cartItemsBox.innerHTML = items.map(item => `
      <div class="cart-item">
        <div class="product">
          <img src="${productImage(item.image)}" alt="${item.name}"
               onerror="this.src=productImageFallback()">
          <div class="info">
            <h4>${item.name}</h4>
            <p>${money(item.price)} each</p>
          </div>
        </div>

        <div class="qty">
          <button title="Decrease quantity"
                  onclick="changeQty('${item.product}', ${item.qty - 1})">&minus;</button>
          <span>${item.qty}</span>
          <button title="Increase quantity"
                  onclick="changeQty('${item.product}', ${item.qty + 1})">+</button>
        </div>

        <span class="line-total">${money(item.price * item.qty)}</span>

        <span class="remove" onclick="removeItem('${item.product}')">Remove</span>
      </div>
    `).join("");

    // Totals — tax math matches order.js exactly
    const tax   = Math.round(base * TAX_RATE);
    const total = base + tax;

    subTotalEl.innerText   = money(base);
    taxEl.innerText        = money(tax);
    grandTotalEl.innerText = money(total);

  } catch (err) {
    renderError("Could not load your cart.");
    setCartState(true);
  }
}

// ── Change item quantity ──────────────────────────────────────────────
async function changeQty(productId, newQty) {
  if (newQty < 1) {
    // qty dropped to 0 — remove the item
    return removeItem(productId);
  }

  try {
    await fetch(`${API_URL}/cart/${productId}`, {
      method:  "PUT",
      headers: authHeaders(),
      body:    JSON.stringify({ qty: newQty }),
    });
    renderCart();
  } catch {
    alert("Error updating cart.");
  }
}

// ── Remove an item from cart ──────────────────────────────────────────
async function removeItem(productId) {
  try {
    await fetch(`${API_URL}/cart/${productId}`, {
      method:  "DELETE",
      headers: authHeaders(),
    });
    renderCart();
  } catch {
    alert("Error removing item.");
  }
}

// ── Guard: a cart page needs a logged-in user ────────────────────────
if (!isLoggedIn()) {
  window.location.href = "login.html";
} else {
  renderCart();
}
