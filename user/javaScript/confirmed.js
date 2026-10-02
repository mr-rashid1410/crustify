// ─────────────────────────────────────────────
//  javaScript/confirmed.js
//  WHY: Fetches the just-placed order from the API
//       using the order ID stored in localStorage,
//       then displays all order details.
// ─────────────────────────────────────────────

const orderId = localStorage.getItem("lastOrderId");

// If no order ID found, user came here directly — redirect to menu
if (!orderId || !isLoggedIn()) {
  window.location.href = "menu.html";
}

// ── Fetch and display the order ───────────────────────────────────────
async function loadConfirmedOrder() {
  try {
    const res   = await fetch(`${API_URL}/orders/${orderId}`, {
      headers: authHeaders(),
    });
    const order = await res.json();

    if (!res.ok) {
      document.body.innerHTML = `<p style="color:#ff6b6b;text-align:center;margin-top:80px;">
        Error loading order: ${order.message}
      </p>`;
      return;
    }

    // ── Order items ───────────────────────────────────────────────────
    const orderBox = document.getElementById("orderItems");
    orderBox.innerHTML = order.items.map(item => `
      <div class="item">
        <span>${item.name} × ${item.qty}</span>
        <span>₹${item.price * item.qty}</span>
      </div>
    `).join("");

    // ── Totals ────────────────────────────────────────────────────────
    document.getElementById("subTotal").innerText = "₹" + order.subtotal;
    document.getElementById("tax").innerText      = "₹" + order.tax;
    document.getElementById("total").innerText    = "₹" + order.total;

    // ── Billing details ───────────────────────────────────────────────
    const b = order.billingDetails;
    document.getElementById("name").innerText    = b.name;
    document.getElementById("address").innerText = b.address;
    document.getElementById("city").innerText    = b.city;
    document.getElementById("phone").innerText   = b.phone;

    // Clear the stored order ID once we've displayed it
    localStorage.removeItem("lastOrderId");

  } catch (err) {
    document.querySelector(".confirm-container").innerHTML = `
      <p style="color:#ff6b6b;text-align:center;margin-top:40px;">
        Network error loading order details.<br><small>${err.message}</small>
      </p>`;
  }
}

function goHome() {
  window.location.href = "menu.html";
}

loadConfirmedOrder();
