// ─────────────────────────────────────────────
//  routes/cartRoutes.js
//  All cart routes require a logged-in user.
//
//  GET    /api/cart                — get my cart
//  POST   /api/cart                — add item
//  PUT    /api/cart/:productId     — update item qty
//  DELETE /api/cart/:productId     — remove one item
//  DELETE /api/cart                — clear entire cart
// ─────────────────────────────────────────────
const express = require("express");
const router  = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

// All cart routes are protected — user must be logged in
router.use(protect);

router.get("/",              getCart);
router.post("/",             addToCart);
router.put("/:productId",    updateCartItem);
router.delete("/clear",      clearCart);       // must be before /:productId
router.delete("/:productId", removeCartItem);

module.exports = router;
