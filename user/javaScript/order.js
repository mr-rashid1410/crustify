// ─────────────────────────────────────────────
//  javaScript/order.js
//  WHY: Replaced localStorage with API calls.
//       Fetches the user's cart from the server,
//       shows the order summary, and POSTs the
//       order to /api/orders on form submission.
// ─────────────────────────────────────────────

// Redirect if not logged in
if (!isLoggedIn()) {
  alert("Please login to place an order.");
  window.location.href = "login.html";
}

const orderItems  = document.getElementById("orderItems");
const subtotalEl  = document.getElementById("subtotal");
const taxEl       = document.getElementById("tax");
const totalEl     = document.getElementById("total");
const placeBtn    = document.getElementById("placeOrder");

let cartSubtotal = 0;

// ── Load cart summary on the right side ──────────────────────────────
async function loadOrderSummary() {
  try {
    const res  = await fetch(`${API_URL}/cart`, { headers: authHeaders() });
    const data = await res.json();

    if (!res.ok || !data.items || data.items.length === 0) {
      orderItems.innerHTML = `<p style="color:#aaa;">Your cart is empty. <a href="menu.html" style="color:#e74c3c;">Go to menu</a></p>`;
      placeBtn.disabled = true;
      return;
    }

    cartSubtotal = data.subtotal;
    const tax    = Math.round(cartSubtotal * 0.09);
    const total  = cartSubtotal + tax;

    orderItems.innerHTML = data.items.map(item => `
      <div class="order-item">
        <span>${item.name} × ${item.qty}</span>
        <span>₹${item.price * item.qty}</span>
      </div>
    `).join("");

    subtotalEl.innerText = "₹" + cartSubtotal;
    taxEl.innerText      = "₹" + tax;
    totalEl.innerText    = "₹" + total;

  } catch (err) {
    orderItems.innerHTML = `<p style="color:#ff6b6b;">Error loading cart: ${err.message}</p>`;
    placeBtn.disabled = true;
  }
}

// ── Place the order ───────────────────────────────────────────────────
placeBtn.addEventListener("click", async () => {
  const name    = document.getElementById("name").value.trim();
  const email   = document.getElementById("email").value.trim();
  const phone   = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const city    = document.getElementById("city").value.trim();
  const pincode = document.getElementById("pincode").value.trim();

  if (!name || !email || !phone || !address || !city || !pincode) {
    alert("Please fill all billing details before placing order.");
    return;
  }

  placeBtn.disabled   = true;
  placeBtn.innerText  = "Placing Order...";

  try {
    const res  = await fetch(`${API_URL}/orders`, {
      method:  "POST",
      headers: authHeaders(),
      body:    JSON.stringify({ name, email, phone, address, city, pincode }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Error: " + data.message);
      placeBtn.disabled  = false;
      placeBtn.innerText = "PLACE ORDER";
      return;
    }

    // Save order ID temporarily so confirmed.html can fetch it
    localStorage.setItem("lastOrderId", data.orderId);

    // Redirect to confirmation page
    window.location.href = "confirmed.html";

  } catch (err) {
    alert("Network error. Is the server running?");
    placeBtn.disabled  = false;
    placeBtn.innerText = "PLACE ORDER";
  }
});

// Load order summary on page load
loadOrderSummary();
