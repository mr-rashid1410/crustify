// ─────────────────────────────────────────────
//  models/Order.js
//  WHY: Permanently records every placed order.
//       Even if a product is later deleted, the
//       order history remains intact because item
//       details are snapshotted (name, price, etc.)
// ─────────────────────────────────────────────
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name:    { type: String, required: true },   // snapshot
  price:   { type: Number, required: true },   // snapshot
  image:   { type: String },
  qty:     { type: Number, required: true },
});

const billingSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  email:   { type: String, required: true },
  phone:   { type: String, required: true },
  address: { type: String, required: true },
  city:    { type: String, required: true },
  pincode: { type: String, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items:          [orderItemSchema],
    billingDetails: billingSchema,
    subtotal:       { type: Number, required: true },
    tax:            { type: Number, required: true },
    total:          { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
