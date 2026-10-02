// ─────────────────────────────────────────────
//  models/User.js
//  WHY: Defines how a user is stored in MongoDB.
//       Includes password hashing before saving
//       so plain-text passwords are never stored.
// ─────────────────────────────────────────────
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    // role: "user" = regular customer, "admin" = can manage products/orders
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

// ── Pre-save hook: hash the password before storing ──────────────────
// This runs automatically every time a user document is saved
userSchema.pre("save", async function (next) {
  // Only hash if the password field was changed (avoids double-hashing)
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare a plain password with the hashed one ─────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
