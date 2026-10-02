// ─────────────────────────────────────────────
//  routes/productRoutes.js
//  Public endpoints (no login needed):
//    GET  /api/products        — list all available products
//                              — optional ?category=<name> filter
//    GET  /api/products/:id    — get single product
//
//  Admin-only endpoints (login + admin role):
//    GET  /api/products/admin/all  — list all including unavailable
//    POST /api/products/upload     — upload one product image
//    POST /api/products            — create product
//    PUT  /api/products/:id        — update product
//    DELETE /api/products/:id      — delete product
// ─────────────────────────────────────────────
const express = require("express");
const router  = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin,
  uploadProductImage,
} = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { uploadSingleImage } = require("../middleware/uploadMiddleware");

// Public routes
router.get("/",    getAllProducts);
router.get("/admin/all", protect, adminOnly, getAllProductsAdmin); // must be before /:id
router.get("/:id", getProductById);

// Admin-only routes
router.post("/upload", protect, adminOnly, uploadSingleImage("image"), uploadProductImage);
router.post("/",        protect, adminOnly, createProduct);
router.put("/:id",      protect, adminOnly, updateProduct);
router.delete("/:id",   protect, adminOnly, deleteProduct);

module.exports = router;
