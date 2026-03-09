const express = require("express");
const router = express.Router();
const Stock = require("../models/Stock");

// ✅ Create Stock
router.post("/", async (req, res) => {
  try {
    const { name, quantity, bv, addedBy, distributorPrice, retailPrice } = req.body;

    if (!name || !quantity) {
      return res.status(400).json({ message: "Name and quantity are required" });
    }

    // 🧠 use the user ID (ObjectId) either from auth or request body
    const creatorId = req.user?.id || addedBy;

    if (creatorId && !creatorId.match(/^[0-9a-fA-F]{24}$/)) {
      // if addedBy is not a valid ObjectId, skip it (avoid the BSON error)
      console.warn("⚠️ Invalid addedBy ID format, skipping field.");
    }

    const stock = new Stock({
      name,
      quantity,
      bv,
      distributorPrice,
      retailPrice,
      addedBy: creatorId && creatorId.match(/^[0-9a-fA-F]{24}$/) ? creatorId : undefined,
    });

    await stock.save();
    await stock.populate("addedBy", "username email"); // populate user info

    res.status(201).json(stock);
  } catch (error) {
    console.error("❌ Create Stock Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Get All Stock Items (with agent info)
router.get("/", async (req, res) => {
  try {
    const stock = await Stock.find()
      .populate("addedBy", "username email")
      .sort({ createdAt: -1 });

    res.json(stock);
  } catch (error) {
    console.error("❌ Fetch Stock Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Get Single Stock Item
router.get("/:id", async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id).populate("addedBy", "username email");
    if (!stock) return res.status(404).json({ message: "Stock not found" });
    res.json(stock);
  } catch (error) {
    console.error("❌ Single Stock Fetch Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Update Stock
router.put("/:id", async (req, res) => {
  try {
    const { name, quantity, bv, distributorPrice, retailPrice } = req.body;

    const updatedStock = await Stock.findByIdAndUpdate(
      req.params.id,
      { name, quantity, bv, distributorPrice, retailPrice },
      { new: true }
    ).populate("addedBy", "username email");

    if (!updatedStock) return res.status(404).json({ message: "Stock not found" });
    res.json(updatedStock);
  } catch (error) {
    console.error("❌ Update Stock Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Decrement Stock (Sales or Usage)
router.patch("/decrement", async (req, res) => {
  try {
    const { name, quantity } = req.body;

    const product = await Stock.findOne({ name });
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.quantity < quantity)
      return res.status(400).json({ message: "Insufficient stock" });

    product.quantity -= quantity;
    await product.save();
    await product.populate("addedBy", "username email");

    res.json({ success: true, message: "Stock updated", product });
  } catch (error) {
    console.error("❌ Decrement Stock Error:", error);
    res.status(500).json({ message: "Error updating stock" });
  }
});

// ✅ Delete Stock
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Stock.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Stock not found" });
    res.json({ message: "Stock deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Stock Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
