// ─────────────────────────────────────────────
//  models/Product.js
//  WHY: Stores pizza menu items in MongoDB so
//       they can be managed by admins and fetched
//       dynamically by the frontend (no hardcoding).
// ─────────────────────────────────────────────
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    // image: just the filename, e.g. "margherita.png"
    // The frontend will prepend /images/ when displaying
    image: {
      type: String,
      required: [true, "Image filename is required"],
    },
    // category: the name of a Category document, e.g. "veg".
    // Free-form so admins can add their own categories from the
    // admin panel; the controller checks it exists before saving.
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
