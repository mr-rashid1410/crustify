// ─────────────────────────────────────────────
//  models/Contact.js
//  WHY: Stores contact form submissions so the
//       admin can view and respond to enquiries.
// ─────────────────────────────────────────────
const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, trim: true, lowercase: true },
    phone:     { type: String, default: "" },
    message:   { type: String, required: true },
    isRead:    { type: Boolean, default: false }, // admin can mark as read
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
