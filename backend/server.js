// ─────────────────────────────────────────────
//  server.js  —  Crustify API Entry Point
//
//  HOW TO RUN:
//    1. cd backend
//    2. npm install
//    3. npm run dev        (development with auto-restart)
//       OR  npm start      (production)
//
//  The server starts on http://localhost:5000
// ─────────────────────────────────────────────
const express = require("express");
const cors    = require("cors");
const dotenv  = require("dotenv");
const path    = require("path");
const connectDB = require("./config/db");

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────

// Enable CORS — allows the frontend (running on a different port) to call this API
app.use(cors({
  origin: "*",   // Allow all origins in development
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Parse incoming JSON request bodies
app.use(express.json());

// ── Uploaded product images ────────────────────────────────────────────
// Images uploaded from the admin product form live in backend/uploads
// and are served here. Both frontends build the same URL from this
// mount point, so the customer menu shows exactly the same picture
// the admin picked — independent of each app's static file server.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ────────────────────────────────────────────────────────────
app.use("/api/auth",      require("./routes/authRoutes"));
app.use("/api/products",  require("./routes/productRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/cart",      require("./routes/cartRoutes"));
app.use("/api/orders",    require("./routes/orderRoutes"));
app.use("/api/contact",   require("./routes/contactRoutes"));

// ── Health Check ──────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "Crustify API is running!",
    version: "1.0.0",
    endpoints: {
      auth:       "/api/auth",
      products:   "/api/products",
      categories: "/api/categories",
      cart:       "/api/cart",
      orders:     "/api/orders",
      uploads:    "/uploads",
    },
  });
});

// ── 404 Handler ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.url}` });
});

// ── Start Server ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🍕 Crustify API running at http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log(`   Press Ctrl+C to stop\n`);
});
