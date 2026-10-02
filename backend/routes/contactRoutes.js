// ─────────────────────────────────────────────
//  routes/contactRoutes.js
//
//  POST /api/contact               — submit form (public)
//  GET  /api/contact/admin/all     — all enquiries (admin)
//  PUT  /api/contact/:id/read      — mark as read (admin)
// ─────────────────────────────────────────────
const express  = require("express");
const router   = express.Router();
const { submitContact, getAllContacts, markAsRead } = require("../controllers/contactController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/",              submitContact);
router.get("/admin/all",      protect, adminOnly, getAllContacts);
router.put("/:id/read",       protect, adminOnly, markAsRead);

module.exports = router;
