// ─────────────────────────────────────────────
//  controllers/categoryController.js
//  WHY: Manages the product categories used by the
//       admin panel's category tab and the category
//       dropdown inside the product form.
//
//  Rules enforced here:
//    1. Category names are unique (case-insensitive).
//    2. Exactly one category is flagged isDefault.
//    3. The default category can be renamed and can be
//       re-pointed to another category, but it can
//       NEVER be deleted.
//    4. Deleting any other category moves every product
//       that used it into the default category, so no
//       product is ever left pointing at a category
//       that no longer exists.
// ─────────────────────────────────────────────
const Category = require("../models/Category");
const Product  = require("../models/Product");

// Categories the menu ships with. Only used to bootstrap an
// empty collection (the seed script inserts the same set) so
// there is always a default category to fall back to.
// Keep this in sync with the categories in seed.js —
// the first entry is the default.
const STARTER_CATEGORIES = [
  "pizza",
  "burger",
  "sandwich",
  "shawarma",
  "sides",
  "desserts",
  "beverages",
];

// Escape a string so it can be used safely inside a RegExp
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ── Safety net ─────────────────────────────────────────────────────────
// Guarantees the collection is never empty and always has exactly
// one default. This keeps the admin dropdown populated and makes
// the "move products to default" rule on delete always possible,
// even on a database that was seeded before categories existed.
const ensureCategories = async () => {
  const total = await Category.countDocuments();
  if (total === 0) {
    await Category.insertMany(
      STARTER_CATEGORIES.map((name, i) => ({ name, isDefault: i === 0 }))
    );
  }

  const hasDefault = await Category.exists({ isDefault: true });
  if (!hasDefault) {
    const oldest = await Category.findOne().sort({ createdAt: 1 });
    if (oldest) {
      oldest.isDefault = true;
      await oldest.save();
    }
  }
};

// Count how many products sit in each category, in one query
const countProductsByCategory = async () => {
  const grouped = await Product.aggregate([
    { $group: { _id: "$category", total: { $sum: 1 } } },
  ]);
  const map = {};
  grouped.forEach((row) => { map[row._id] = row.total; });
  return map;
};

// ── GET /api/categories ───────────────────────────────────────────────
// Lists every category with its product count — Admin only
const getAllCategories = async (req, res) => {
  try {
    await ensureCategories();

    const categories = await Category.find()
      .sort({ isDefault: -1, name: 1 })
      .lean();
    const countMap = await countProductsByCategory();

    res.json(
      categories.map((c) => ({ ...c, productCount: countMap[c.name] || 0 }))
    );
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── GET /api/categories/default ───────────────────────────────────────
// Returns the default (fallback) category — Admin only
const getDefaultCategory = async (req, res) => {
  try {
    await ensureCategories();

    const category = await Category.findOne({ isDefault: true }).lean();
    if (!category) {
      return res.status(404).json({ message: "No default category set" });
    }

    const countMap = await countProductsByCategory();
    res.json({ ...category, productCount: countMap[category.name] || 0 });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── POST /api/categories ──────────────────────────────────────────────
// Creates a new category — Admin only
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }
    const cleanName = name.trim();

    const existing = await Category.findOne({
      name: { $regex: `^${escapeRegex(cleanName)}$`, $options: "i" },
    });
    if (existing) {
      return res.status(400).json({
        message: `Category "${existing.name}" already exists`,
      });
    }

    await ensureCategories();

    // A new category never steals the default flag
    const category = await Category.create({ name: cleanName, isDefault: false });

    res.status(201).json({
      message: "Category created successfully!",
      category: { ...category.toObject(), productCount: 0 },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── PUT /api/categories/:id ───────────────────────────────────────────
// Renames a category (the default one too) and moves its products
// across so no product is left on a stale name — Admin only
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }
    const cleanName = name.trim();

    const isRename = cleanName.toLowerCase() !== category.name.toLowerCase();
    if (isRename) {
      const clash = await Category.findOne({
        _id: { $ne: category._id },
        name: { $regex: `^${escapeRegex(cleanName)}$`, $options: "i" },
      });
      if (clash) {
        return res.status(400).json({
          message: `Category "${clash.name}" already exists`,
        });
      }
    }

    const previousName = category.name;
    category.name = cleanName;
    const updated = await category.save();

    // Carry the products over to the new name
    let movedProducts = 0;
    if (isRename) {
      const result = await Product.updateMany(
        { category: previousName },
        { category: cleanName }
      );
      movedProducts = result.modifiedCount;
    }

    res.json({
      message: "Category updated successfully!",
      category: { ...updated.toObject(), productCount: movedProducts },
      movedProducts,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── PUT /api/categories/:id/default ───────────────────────────────────
// Marks a category as the default — Admin only
// Demotes whichever category held the flag so there is only one.
const setDefaultCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await Category.updateMany(
      { _id: { $ne: category._id }, isDefault: true },
      { isDefault: false }
    );

    category.isDefault = true;
    const updated = await category.save();

    res.json({
      message: `"${updated.name}" is now the default category!`,
      category: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── DELETE /api/categories/:id ────────────────────────────────────────
// Deletes a category — Admin only
// The default category is protected; every other category hands
// its products over to the default one before being removed.
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (category.isDefault) {
      return res.status(400).json({
        message:
          "The default category cannot be deleted. Make another category the default first.",
      });
    }

    const fallback = await Category.findOne({ isDefault: true });
    if (!fallback) {
      return res.status(400).json({
        message: "No default category available to move products into",
      });
    }

    const result = await Product.updateMany(
      { category: category.name },
      { category: fallback.name }
    );

    await category.deleteOne();

    res.json({
      message: `Category deleted! ${
        result.modifiedCount
      } product(s) moved to "${fallback.name}".`,
      movedProducts: result.modifiedCount,
      movedTo: fallback.name,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

module.exports = {
  getAllCategories,
  getDefaultCategory,
  createCategory,
  updateCategory,
  setDefaultCategory,
  deleteCategory,
};