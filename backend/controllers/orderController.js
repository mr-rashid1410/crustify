// ─────────────────────────────────────────────
//  controllers/orderController.js
//  WHY: Handles order placement and order history.
//       When an order is placed, cart items are
//       snapshotted into the order (so item details
//       are preserved even if products change later).
// ─────────────────────────────────────────────
const Order = require("../models/Order");
const Cart  = require("../models/Cart");
const User  = require("../models/User");

// ── POST /api/orders ──────────────────────────────────────────────────
// Places an order using the current user's cart
const placeOrder = async (req, res) => {
  try {
    const { name, email, phone, address, city, pincode } = req.body;

    // Validate billing details
    if (!name || !email || !phone || !address || !city || !pincode) {
      return res.status(400).json({ message: "Please fill all billing details" });
    }

    // Get the user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // Calculate totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.qty, 0
    );
    const tax   = Math.round(subtotal * 0.09); // 9% tax
    const total = subtotal + tax;

    // Create the order — snapshot all cart items
    const order = await Order.create({
      user: req.user._id,
      items: cart.items.map((item) => ({
        product: item.product,
        name:    item.name,
        price:   item.price,
        image:   item.image,
        qty:     item.qty,
      })),
      billingDetails: { name, email, phone, address, city, pincode },
      subtotal,
      tax,
      total,
      status: "confirmed",
    });

    // Clear the cart after successful order
    await Cart.findOneAndDelete({ user: req.user._id });

    res.status(201).json({
      message: "Order placed successfully!",
      orderId: order._id,
      order,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── GET /api/orders ───────────────────────────────────────────────────
// Returns the logged-in user's order history
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── GET /api/orders/:id ───────────────────────────────────────────────
// Returns a single order by ID (user must own the order)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ensure the order belongs to the requesting user (unless admin)
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorised to view this order" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── GET /api/orders/admin/all ─────────────────────────────────────────
// Returns ALL orders — Admin only
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── PUT /api/orders/:id/status ────────────────────────────────────────
// Updates the order status — Admin only
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "preparing", "delivered", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated!", order });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── GET /api/orders/admin/stats ───────────────────────────────────────
// Returns summary stats for the admin dashboard
const getDashboardStats = async (req, res) => {
  try {
    const [totalOrders, totalUsers, totalProducts, orders] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments(),
      require("../models/Product").countDocuments(),
      Order.find(),
    ]);

    const revenue = orders.reduce((sum, o) => sum + o.total, 0);

    res.json({ totalOrders, totalUsers, totalProducts, revenue });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── GET /api/orders/admin/users ───────────────────────────────────────
// Returns all users — Admin only
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
  getAllUsers,
};
