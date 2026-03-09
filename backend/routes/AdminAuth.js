const express = require("express");
// const bcrypt = require("bcrypt");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const authenticateToken = require("../authToken"); // Assuming authenticateToken is your middleware to verify JWT

const router = express.Router(); // Create the router instance

  // Admin login route
  router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Please provide username and password" });
    }

    try {
      const admin = await Admin.findOne({ username: username });
      if (!admin) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.status(200).json({ message: "Login successful", token });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

// Admin Dashboard route
router.get("/admin-dashboard", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }
    res.status(200).json({ message: "Welcome to the admin dashboard" });
  } catch (error) {
    res.status(500).json({ message: "Error accessing admin dashboard", error: error.message });
  }
});

module.exports = router;
