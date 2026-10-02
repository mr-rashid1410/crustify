// ─────────────────────────────────────────────
//  routes/orderRoutes.js
//
//  User routes (login required):
//    POST /api/orders            — place an order
//    GET  /api/orders            — get my orders
//    GET  /api/orders/:id        — get single order
//
//  Admin routes (login + admin role):
//    GET  /api/orders/admin/all          — all orders
//    GET  /api/orders/admin/stats        — dashboard stats
//    GET  /api/orders/admin/users        — all users
//    PUT  /api/orders/:id/status         — update order status
// ─────────────────────────────────────────────
const express = require("express");
const router  = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
  getAllUsers,
} = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Admin-only routes — must be defined BEFORE /:id to avoid conflicts
router.get("/admin/all",   protect, adminOnly, getAllOrders);
router.get("/admin/stats", protect, adminOnly, getDashboardStats);
router.get("/admin/users", protect, adminOnly, getAllUsers);

// User routes
router.post("/",      protect, placeOrder);
router.get("/",       protect, getMyOrders);
router.get("/:id",    protect, getOrderById);

// Admin: update order status
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

module.exports = router;
