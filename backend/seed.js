// ─────────────────────────────────────────────
//  seed.js  —  Populate the database with initial data
//
//  HOW TO RUN:
//    cd backend
//    npm run seed
//
//  This will:
//    1. Clear all existing products
//    2. Insert the Crustify menu (pizza, burgers, sandwiches,
//       shawarma, sides, desserts and beverages)
//    3. Rebuild the product categories (pizza is the default)
//    4. Create a default admin user (admin@pizzamania.com / admin@123)
// ─────────────────────────────────────────────
const dotenv   = require("dotenv");
const mongoose = require("mongoose");
const Product  = require("./models/Product");
const Category = require("./models/Category");
const User     = require("./models/User");

dotenv.config();

// ── Seed Data ─────────────────────────────────────────────────────────

// Product photos are hosted on Unsplash and resized at request time,
// so the menu stays light without shipping image files in the repo.
// Every id below was checked to return a real image of the right food.
const img = (id) =>
  `https://images.unsplash.com/photo-${id}?w=800&h=600&fit=crop&auto=format&q=80`;

// The first entry is the default category — products of a deleted
// category fall back to it.
const categories = [
  { name: "pizza",     isDefault: true  },
  { name: "burger",    isDefault: false },
  { name: "sandwich",  isDefault: false },
  { name: "shawarma",  isDefault: false },
  { name: "sides",     isDefault: false },
  { name: "desserts",  isDefault: false },
  { name: "beverages", isDefault: false },
];

const products = [
  // ── Pizza ──
  {
    name: "Margherita Pizza",
    description: "Classic Italian base with slow-simmered tomato sauce, fior di latte and torn basil.",
    price: 259,
    image: img("1513104890138-7c749659a591"),
    category: "pizza",
    isPopular: true,
  },
  {
    name: "Pepperoni Feast",
    description: "Double mozzarella blanketed in crisp pepperoni cups with a drizzle of hot honey.",
    price: 349,
    image: img("1594007654729-407eedc4be65"),
    category: "pizza",
    isPopular: true,
  },
  {
    name: "Four Cheese Slice",
    description: "Mozzarella, gorgonzola, aged cheddar and gruyère melted into one glorious cheese pull.",
    price: 389,
    image: img("1565299624946-b28f40a0ae38"),
    category: "pizza",
    isPopular: false,
  },

  // ── Burgers ──
  {
    name: "Classic Cheeseburger",
    description: "Flame-grilled beef patty, aged cheddar, crisp lettuce and our house burger sauce.",
    price: 219,
    image: img("1568901346375-23c9450c58cd"),
    category: "burger",
    isPopular: true,
  },
  {
    name: "Double Patty Burger",
    description: "Two seared patties, caramelised onions, pickles and smoked cheddar in a toasted brioche bun.",
    price: 329,
    image: img("1550317138-10000687a72b"),
    category: "burger",
    isPopular: false,
  },
  {
    name: "Crispy Chicken Burger",
    description: "Buttermilk-fried chicken fillet with slaw, pickles and a cooling ranch drizzle.",
    price: 259,
    image: img("1615297928064-24977384d0da"),
    category: "burger",
    isPopular: false,
  },
  {
    name: "Smokehouse Burger",
    description: "Beef patty with smoked bacon, charred onion and a smoky barbecue glaze.",
    price: 349,
    image: img("1586190848861-99aa4a171e90"),
    category: "burger",
    isPopular: false,
  },

  // ── Sandwiches ──
  {
    name: "Grilled Cheese Sandwich",
    description: "Three cheeses melted between butter-toasted sourdough, cut until it just holds together.",
    price: 179,
    image: img("1528735602780-2552fd46c7af"),
    category: "sandwich",
    isPopular: false,
  },
  {
    name: "Club Sandwich",
    description: "Triple-decker with roast chicken, streaky bacon, lettuce, tomato and creamy egg mayo.",
    price: 239,
    image: img("1469648034646-7911874fe62b"),
    category: "sandwich",
    isPopular: false,
  },

  // ── Shawarma ──
  {
    name: "Chicken Shawarma",
    description: "Spit-roasted chicken shaved to order with garlic sauce, pickles and sumac onions.",
    price: 189,
    image: img("1529006557810-274b9b2fc783"),
    category: "shawarma",
    isPopular: true,
  },
  {
    name: "Peri Peri Shawarma",
    description: "The same shaved chicken tossed in fiery peri peri marinade with a lemon-tahini sauce.",
    price: 209,
    image: img("1748955307113-992406078fee"),
    category: "shawarma",
    isPopular: false,
  },

  // ── Sides ──
  {
    name: "Truffle French Fries",
    description: "Triple-cooked chips showered with truffle oil, parmesan and fresh parsley.",
    price: 149,
    image: img("1463183665146-ce2ed31df6b0"),
    category: "sides",
    isPopular: false,
  },
  {
    name: "Loaded Fries Tray",
    description: "Fries buried under cheese sauce, jalapenos and spring onion. Shareable, or don't.",
    price: 199,
    image: img("1639744211106-6dd155bd96b6"),
    category: "sides",
    isPopular: false,
  },

  // ── Desserts ──
  {
    name: "Chocolate Brownie",
    description: "Fudgy dark chocolate brownie with a molten centre and a crisp sugar crust.",
    price: 159,
    image: img("1676984613195-8e32b8e7c034"),
    category: "desserts",
    isPopular: false,
  },
  {
    name: "Vanilla Sundae",
    description: "Madagascan vanilla bean gelato drowned in warm chocolate sauce.",
    price: 129,
    image: img("1551024506-0bccd828d307"),
    category: "desserts",
    isPopular: false,
  },

  // ── Beverages ──
  {
    name: "Cold Coffee",
    description: "Double shot blended with milk and ice until it turns into a foam-topped frappe.",
    price: 139,
    image: img("1571877227200-a0d98ea607e9"),
    category: "beverages",
    isPopular: false,
  },
  {
    name: "Iced Lemon Soda",
    description: "Freshly squeezed lemon, soda and a pinch of black salt over plenty of ice.",
    price: 99,
    image: img("1544145945-f90425340c7e"),
    category: "beverages",
    isPopular: false,
  },
];

const adminUser = {
  name: "Admin",
  email: "admin@pizzamania.com",
  password: "admin@123",
  role: "admin",
};

// ── Run Seeder ────────────────────────────────────────────────────────
const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing products
    await Product.deleteMany();
    console.log("🗑️  Cleared existing products");

    // Insert new products
    const inserted = await Product.insertMany(products);
    console.log(`✅ Inserted ${inserted.length} products`);

    // Rebuild categories (pizza is the default)
    await Category.deleteMany();
    await Category.insertMany(categories);
    console.log(`✅ Inserted ${categories.length} categories (default: pizza)`);

    // Create admin user if not exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (!existingAdmin) {
      await User.create(adminUser);
      console.log("✅ Admin user created: admin@pizzamania.com / admin@123");
    } else {
      console.log("ℹ️  Admin user already exists");
    }

    console.log("\n🌱 Database seeded successfully!");
    console.log("   Admin login: admin@pizzamania.com / admin@123");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error.message);
    process.exit(1);
  }
};

seedDB();