// ─────────────────────────────────────────────
//  controllers/authController.js
//  WHY: Handles user registration, login, and
//       fetching the current user's profile.
//       Generates JWT tokens for authentication.
// ─────────────────────────────────────────────
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ── Helper: generate a JWT token for a user ID ───────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d", // token valid for 7 days
  });
};

// ── POST /api/auth/register ───────────────────────────────────────────
// Creates a new user account
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check all required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    // Check if email is already registered
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered. Please login." });
    }

    // Create the user (password is hashed automatically by User model pre-save hook)
    const user = await User.create({ name, email, password });

    res.status(201).json({
      message: "Account created successfully!",
      user: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────
// Logs in an existing user and returns a JWT token
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "No account found with this email. Please register." });
    }

    // Compare entered password with the hashed one in DB
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password. Please try again." });
    }

    res.json({
      message: "Login successful!",
      user: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────
// Returns the currently logged-in user's profile (requires token)
const getMe = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── PUT /api/auth/profile ─────────────────────────────────────────────
// Updates name and phone — email cannot be changed
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name cannot be empty" });
    }

    const user = await User.findById(req.user._id);
    user.name  = name.trim();
    user.phone = phone ? phone.trim() : user.phone;
    await user.save();

    res.json({ message: "Profile updated!", name: user.name, phone: user.phone });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

module.exports = { register, login, getMe, updateProfile };
