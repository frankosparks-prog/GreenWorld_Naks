const express = require("express");
const router = express.Router();
const Massage = require("../models/Massage");

// ✅ Record New Massage Sale
router.post("/", async (req, res) => {
  try {
    const { serviceType, price, addedBy, notes } = req.body;

    if (!serviceType || !price) {
      return res.status(400).json({ message: "Service type and price are required" });
    }

    // 🧠 Handle User ID (Auth Middleware or Manual Input)
    const agentId = req.user?.id || addedBy;

    if (!agentId || !agentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid or missing Sales Agent ID" });
    }

    const newSale = new Massage({
      serviceType,
      price,
      salesAgent: agentId,
      notes,
    });

    await newSale.save();
    await newSale.populate("salesAgent", "username email");

    res.status(201).json(newSale);
  } catch (error) {
    console.error("❌ Record Massage Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Get All Massage Records (For Admin)
router.get("/", async (req, res) => {
  try {
    const records = await Massage.find()
      .populate("salesAgent", "username email")
      .sort({ createdAt: -1 });

    res.json(records);
  } catch (error) {
    console.error("❌ Fetch Massage Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Delete Record
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Massage.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Massage Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;