// ─────────────────────────────────────────────
//  middleware/authMiddleware.js
//  WHY: Protects private routes. Any route that
//       needs a logged-in user (or admin) runs
//       this middleware first before the controller.
// ─────────────────────────────────────────────
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ── protect: verify JWT and attach user to req ───────────────────────
const protect = async (req, res, next) => {
  let token;

  // JWT is sent in the Authorization header as: "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];

      // Verify the token with our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user info to request (exclude the password field)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User no longer exists" });
      }

      next(); // proceed to the actual controller
    } catch (error) {
      return res.status(401).json({ message: "Not authorised, invalid token" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorised, no token provided" });
  }
};

// ── adminOnly: must be used AFTER protect ────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied — admins only" });
  }
};

module.exports = { protect, adminOnly };
