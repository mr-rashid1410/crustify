// ─────────────────────────────────────────────
//  routes/categoryRoutes.js
//  Public endpoints (no login needed):
//    GET  /api/categories  — list categories, used by the
//                           customer menu page filter chips
//
//  Admin-only endpoints (login + admin role):
//    GET    /api/categories/default    — get the default category
//    POST   /api/categories            — create category
//    PUT    /api/categories/:id        — rename category
//    PUT    /api/categories/:id/default— make it the default category
//    DELETE /api/categories/:id        — delete category (default blocked)
//
//  Deleting a category moves its products into the default one.
// ─────────────────────────────────────────────
const express = require("express");
const router  = express.Router();
const {
  getAllCategories,
  getDefaultCategory,
  createCategory,
  updateCategory,
  setDefaultCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/",           getAllCategories);
router.get("/default",    protect, adminOnly, getDefaultCategory); // must be before /:id
router.post("/",          protect, adminOnly, createCategory);
router.put("/:id",        protect, adminOnly, updateCategory);
router.put("/:id/default",protect, adminOnly, setDefaultCategory);
router.delete("/:id",     protect, adminOnly, deleteCategory);

module.exports = router;