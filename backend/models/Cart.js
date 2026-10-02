// ─────────────────────────────────────────────
//  models/Cart.js
//  WHY: Stores the active shopping cart for each
//       logged-in user in the database, so the cart
//       persists across devices and sessions.
// ─────────────────────────────────────────────
const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name:  { type: String, required: true },  // snapshot at time of adding
  price: { type: Number, required: true },  // snapshot at time of adding
  image: { type: String },
  qty:   { type: Number, default: 1, min: 1 },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one cart document per user
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

// ── Virtual: compute cart totals without storing them ────────────────
cartSchema.virtual("subtotal").get(function () {
  return this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
});

module.exports = mongoose.model("Cart", cartSchema);
