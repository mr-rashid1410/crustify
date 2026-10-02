// ─────────────────────────────────────────────
//  controllers/productController.js
//  WHY: Manages all pizza menu items.
//       Public routes: anyone can view products.
//       Admin routes: add, edit, delete products.
// ─────────────────────────────────────────────
const Product  = require("../models/Product");
const Category = require("../models/Category");

// Escape a string so it can be used safely inside a RegExp
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Confirms a category name exists, so a product can never be
// saved against a category the admin has deleted
const categoryExists = async (name) =>
  Category.exists({
    name: { $regex: `^${escapeRegex(name.trim())}$`, $options: "i" },
  });

// ── GET /api/products ─────────────────────────────────────────────────
// Returns all available products (public — no login needed)
// Optional filter: GET /api/products?category=burger
//                  GET /api/products?category=   → every product
const getAllProducts = async (req, res) => {
  try {
    const filter = { isAvailable: true };

    // Filter by category name, ignoring case and stray whitespace
    const category = String(req.query.category || "").trim();
    if (category) {
      filter.category = {
        $regex: `^${escapeRegex(category)}$`,
        $options: "i",
      };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── GET /api/products/:id ─────────────────────────────────────────────
// Returns a single product by ID (public)
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── POST /api/products ────────────────────────────────────────────────
// Creates a new product — Admin only
const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category, isPopular } = req.body;

    if (!name || !description || !price || !image || !category) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    if (!(await categoryExists(category))) {
      return res.status(400).json({
        message: `Category "${category.trim()}" does not exist. Add it from the Categories tab first.`,
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      image,
      category: category.trim(),
      isPopular: isPopular || false,
    });

    res.status(201).json({ message: "Product created successfully!", product });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── PUT /api/products/:id ─────────────────────────────────────────────
// Updates an existing product — Admin only
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update only provided fields
    const { name, description, price, image, category, isPopular, isAvailable } = req.body;
    if (name)        product.name        = name;
    if (description) product.description = description;
    if (price)       product.price       = price;
    if (image)       product.image       = image;
    if (category) {
      if (!(await categoryExists(category))) {
        return res.status(400).json({
          message: `Category "${category.trim()}" does not exist. Add it from the Categories tab first.`,
        });
      }
      product.category = category.trim();
    }
    if (isPopular !== undefined) product.isPopular   = isPopular;
    if (isAvailable !== undefined) product.isAvailable = isAvailable;

    const updated = await product.save();
    res.json({ message: "Product updated successfully!", product: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── DELETE /api/products/:id ──────────────────────────────────────────
// Deletes a product — Admin only
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── GET /api/products/admin/all ───────────────────────────────────────
// Returns ALL products including unavailable ones — Admin only
const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── POST /api/products/upload ──────────────────────────────────────────
// Accepts one multipart image from the admin product form and stores it
// in backend/uploads. Responds with the relative value to save into
// Product.image — Admin only
const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file was received" });
    }

    res.status(201).json({
      message: "Image uploaded successfully!",
      // What gets saved to Product.image
      image: `uploads/${req.file.filename}`,
      // Path on this server, for reference
      path: `/uploads/${req.file.filename}`,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin,
  uploadProductImage,
};
