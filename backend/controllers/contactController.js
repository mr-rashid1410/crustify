// ─────────────────────────────────────────────
//  controllers/contactController.js
// ─────────────────────────────────────────────
const Contact = require("../models/Contact");

// ── POST /api/contact ─────────────────────────────────────────────────
// Public — anyone can submit the contact form
const submitContact = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, message } = req.body;

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    await Contact.create({ firstName, lastName, email, phone, message });

    res.status(201).json({ message: "Message sent successfully! We will get back to you soon." });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── GET /api/contact/admin/all ────────────────────────────────────────
// Admin only — view all enquiries
const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// ── PUT /api/contact/:id/read ─────────────────────────────────────────
// Admin only — mark an enquiry as read
const markAsRead = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!contact) return res.status(404).json({ message: "Enquiry not found" });
    res.json({ message: "Marked as read", contact });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

module.exports = { submitContact, getAllContacts, markAsRead };
