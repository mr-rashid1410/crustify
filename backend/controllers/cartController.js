// ─────────────────────────────────────────────
//  controllers/cartController.js
//  WHY: Manages the user's server-side shopping cart.
//       Storing the cart in the DB means it persists
//       across devices and browser sessions.
// ─────────────────────────────────────────────
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ── GET /api/cart ─────────────────────────────────────────────────────
// Returns the current user's cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // No cart yet — return empty cart
      return res.json({ items: [], subtotal: 0 });
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.qty, 0
    );

    res.json({ items: cart.items, subtotal });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── POST /api/cart ────────────────────────────────────────────────────
// Adds an item to the cart (or increases qty if already present)
const addToCart = async (req, res) => {
  try {
    const { productId, qty = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Verify the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (!product.isAvailable) {
      return res.status(400).json({ message: "Product is not available" });
    }

    // Find or create the cart for this user
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if item already in cart
    const existing = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existing) {
      existing.qty += qty; // increase quantity
    } else {
      cart.items.push({
        product: product._id,
        name:    product.name,
        price:   product.price,
        image:   product.image,
        qty,
      });
    }

    await cart.save();

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.qty, 0
    );

    res.json({ message: "Item added to cart!", items: cart.items, subtotal });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── PUT /api/cart/:productId ──────────────────────────────────────────
// Updates the quantity of a specific cart item
const updateCartItem = async (req, res) => {
  try {
    const { qty } = req.body;
    const { productId } = req.params;

    if (!qty || qty < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    item.qty = qty;
    await cart.save();

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.qty, 0
    );

    res.json({ message: "Cart updated!", items: cart.items, subtotal });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── DELETE /api/cart/:productId ───────────────────────────────────────
// Removes a single item from the cart
const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.qty, 0
    );

    res.json({ message: "Item removed!", items: cart.items, subtotal });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── DELETE /api/cart ──────────────────────────────────────────────────
// Clears the entire cart (called after order is placed)
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ message: "Cart cleared!" });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
