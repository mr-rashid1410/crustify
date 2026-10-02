// ─────────────────────────────────────────────
//  models/Category.js
//  WHY: Stores the product categories an admin
//       can manage from the admin panel. Exactly
//       one category is flagged isDefault — it is
//       the fallback bucket products move into
//       when their own category is deleted.
// ─────────────────────────────────────────────
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      // Unique regardless of casing, so "Veg" and "veg"
      // cannot both exist in the menu.
      unique: true,
      index: true,
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },
    // isDefault: the fallback category. There is always
    // exactly one — the controller enforces the invariant
    // by demoting the previous default on every change.
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);