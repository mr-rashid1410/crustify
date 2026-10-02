// ─────────────────────────────────────────────
//  routes/authRoutes.js
//  Endpoints:
//    POST  /api/auth/register  — create account
//    POST  /api/auth/login     — login & get token
//    GET   /api/auth/me        — get own profile (protected)
// ─────────────────────────────────────────────
const express = require("express");
const router  = express.Router();
const { register, login, getMe, updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register",  register);
router.post("/login",     login);
router.get("/me",         protect, getMe);
router.put("/profile",    protect, updateProfile);  // update name & phone

module.exports = router;
