// const express = require("express");
// const Stock = require("../models/Stock");
// const Sale = require("../models/Sales.js");
// const router = express.Router();


// // ➕ Create Sale
// router.post("/", async (req, res) => {
//   try {
//     const { distributorId, product, quantity, bv } = req.body;

//     if (!distributorId || !product || !quantity || !bv) {
//       return res.status(400).json({ error: "All fields are required." });
//     }

//     // 🔍 Find product by name
//     const foundProduct = await Stock.findOne({ name: product });
//     if (!foundProduct) {
//       return res.status(404).json({ error: "Product not found." });
//     }

//     // ⚠️ Check stock
//     if (foundProduct.stock < quantity) {
//       return res.status(400).json({
//         error: `Not enough stock for ${foundProduct.name}. Available: ${foundProduct.stock}`,
//       });
//     }

//     // 🧮 Total BV
//     const totalBV = quantity * bv;

//     // 💾 Create Sale
//     const sale = await Sale.create({
//       distributor: distributorId,
//       product,
//       quantity,
//       bv,
//       totalBV,
//     });

//     // 🔻 Reduce stock
//     foundProduct.stock -= quantity;
//     await foundProduct.save();

//     res.status(201).json({ message: "Sale recorded successfully", sale });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });


// // 📋 Get all sales (with distributor details)
// router.get("/", async (req, res) => {
//   try {
//     const sales = await Sale.find()
//       .populate("distributor", "name phone gender nationality")
//       .sort({ createdAt: -1 });
//     res.json(sales);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// // ✏️ Update Sale (PUT) — Adjust Stock Correctly
// router.put("/:id", async (req, res) => {
//   try {
//     const { distributorId, product, quantity, bv } = req.body;
//     const totalBV = quantity * bv;

//     const existingSale = await Sale.findById(req.params.id);
//     if (!existingSale) {
//       return res.status(404).json({ error: "Sale not found" });
//     }

//     // 🔍 Get old and new product records
//     const oldProduct = await Stock.findOne({ name: existingSale.product });
//     const newProduct = await Stock.findOne({ name: product });

//     if (!newProduct) {
//       return res.status(404).json({ error: "New product not found" });
//     }

//     // ✅ Revert old stock first
//     if (oldProduct) {
//       oldProduct.stock += existingSale.quantity;
//       await oldProduct.save();
//     }

//     // ⚠️ Check if new stock is enough
//     if (newProduct.stock < quantity) {
//       // rollback oldProduct adjustment if failed
//       if (oldProduct) {
//         oldProduct.stock -= existingSale.quantity;
//         await oldProduct.save();
//       }
//       return res.status(400).json({
//         error: `Not enough stock for ${newProduct.name}. Available: ${newProduct.stock}`,
//       });
//     }

//     // 🔻 Deduct new quantity
//     newProduct.stock -= quantity;
//     await newProduct.save();

//     // 💾 Update Sale Record
//     existingSale.distributor = distributorId;
//     existingSale.product = product;
//     existingSale.quantity = quantity;
//     existingSale.bv = bv;
//     existingSale.totalBV = totalBV;

//     const updatedSale = await existingSale.save();

//     res.json({ message: "Sale updated successfully", updatedSale });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });


// // ❌ Delete Sale — Restore Stock Automatically
// router.delete("/:id", async (req, res) => {
//   try {
//     const sale = await Sale.findById(req.params.id);
//     if (!sale) return res.status(404).json({ error: "Sale not found" });

//     // 🧾 Find product and restore stock
//     const product = await Stock.findOne({ name: sale.product });
//     if (product) {
//       product.quantity += sale.quantity;
//       await product.save();
//     }

//     await Sale.findByIdAndDelete(req.params.id);

//     res.json({ message: "Sale deleted successfully and stock restored" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

//   module.exports = router;

const express = require("express");
const mongoose = require("mongoose");
const Stock = require("../models/Stock");
const Sale = require("../models/Sales.js");
const router = express.Router();

// ➕ Create Sale
router.post("/", async (req, res) => {
  try {
    const { distributorId, product, quantity, bv, price } = req.body;

    if (!distributorId || !product || !quantity || bv === undefined || !price) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // 🔍 Find product by name
    const foundProduct = await Stock.findOne({ name: product });
    if (!foundProduct) {
      return res.status(404).json({ error: "Product not found." });
    }

    // ⚠️ Check stock availability
    if (foundProduct.stock < quantity) {
      return res.status(400).json({
        error: `Not enough stock for ${foundProduct.name}. Available: ${foundProduct.stock}`,
      });
    }

    // 🧮 Totals
    const totalBV = quantity * bv;
    const totalPrice = quantity * price;

    // 💾 Create Sale
    const sale = await Sale.create({
      distributor: distributorId,
      product,
      quantity,
      bv,
      totalBV,
      price,
      totalPrice,
    });

    // 🔻 Reduce stock
    foundProduct.stock -= quantity;
    await foundProduct.save();

    res.status(201).json({ message: "Sale recorded successfully", sale });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📋 Get all sales (optional populate if distributor is a user ref)
// router.get("/", async (req, res) => {
//   try {
//     const sales = await Sale.find().sort({ createdAt: -1 });
//     res.json(sales);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
// 📋 Get all sales (with distributor details)
router.get("/", async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate("distributor", "name phone gender nationality")
      .sort({ createdAt: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✏️ Update Sale — Adjust Stock Correctly
router.put("/:id", async (req, res) => {
  try {
    const { distributorId, product, quantity, bv, price } = req.body;
    const totalBV = quantity * bv;
    const totalPrice = quantity * price;

    const existingSale = await Sale.findById(req.params.id);
    if (!existingSale) {
      return res.status(404).json({ error: "Sale not found" });
    }

    // 🔍 Old and new products
    const oldProduct = await Stock.findOne({ name: existingSale.product });
    const newProduct = await Stock.findOne({ name: product });

    if (!newProduct) {
      return res.status(404).json({ error: "New product not found" });
    }

    // ✅ Revert old stock
    if (oldProduct) {
      oldProduct.quantity += existingSale.quantity;
      await oldProduct.save();
    }

    // ⚠️ Check new stock
    if (newProduct.quantity < quantity) {
      // rollback old stock adjustment
      if (oldProduct) {
        oldProduct.quantity -= existingSale.quantity;
        await oldProduct.save();
      }
      return res.status(400).json({
        error: `Not enough stock for ${newProduct.name}. Available: ${newProduct.quantity}`,
      });
    }

    // 🔻 Deduct new quantity
    newProduct.quantity -= quantity;
    await newProduct.save();

    // 💾 Update Sale Record
    existingSale.distributor = distributorId;
    existingSale.product = product;
    existingSale.quantity = quantity;
    existingSale.bv = bv;
    existingSale.totalBV = totalBV;
    existingSale.price = price;
    existingSale.totalPrice = totalPrice;

    const updatedSale = await existingSale.save();
    res.json({ message: "Sale updated successfully", updatedSale });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ❌ Delete Sale — Restore Stock Automatically
router.delete("/:id", async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ error: "Sale not found" });

    // 🧾 Find product and restore stock
    const product = await Stock.findOne({ name: sale.product });
    if (product) {
      product.quantity += sale.quantity;
      await product.save();
    }

    await Sale.findByIdAndDelete(req.params.id);

    res.json({ message: "Sale deleted successfully and stock restored" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🛒 Process Cart Checkout
router.post("/cart", async (req, res) => {
  try {
    const { distributorId, cartItems, isDebt } = req.body;

    if (!distributorId || !cartItems || !cartItems.length) {
      return res.status(400).json({ error: "Distributor and cart items are required." });
    }

    const transactionId = new mongoose.Types.ObjectId().toString();

    // Verify stock first
    for (const item of cartItems) {
      const foundProduct = await Stock.findOne({ name: item.product });
      if (!foundProduct || foundProduct.quantity < item.quantity) {
        return res.status(400).json({
          error: `Not enough stock for ${item.product}.`,
        });
      }
    }

    const createdSales = [];

    // Process each item
    for (const item of cartItems) {
      const foundProduct = await Stock.findOne({ name: item.product });
      
      const totalBV = item.quantity * item.bv;
      const totalPrice = item.quantity * item.price;
      
      const currentIsDebt = item.isDebt !== undefined ? item.isDebt : isDebt;
      const paymentStatus = currentIsDebt ? 'Not Paid' : 'Paid';
      const paidAmount = currentIsDebt ? 0 : totalPrice;
      const balance = currentIsDebt ? totalPrice : 0;

      const sale = await Sale.create({
        distributor: distributorId,
        product: item.product,
        quantity: item.quantity,
        bv: item.bv,
        totalBV,
        price: item.price,
        totalPrice,
        paymentStatus,
        paidAmount,
        balance,
        isDebt: currentIsDebt,
        transactionId
      });

      createdSales.push(sale);

      // Reduce stock
      foundProduct.quantity -= item.quantity;
      await foundProduct.save();
    }

    res.status(201).json({ message: "Cart checkout successful", sales: createdSales });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔍 Fetch Unpaid Sales for a Distributor
router.get("/distributor/:id/debt", async (req, res) => {
  try {
    const debts = await Sale.find({ 
      distributor: req.params.id, 
      isDebt: true, 
      balance: { $gt: 0 } 
    }).populate("distributor", "name").sort({ createdAt: -1 });
    res.json(debts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 💰 Pay Debt for a Distributor (or specific sale)
router.post("/pay-debt", async (req, res) => {
  try {
    const { distributorId, saleId, amount } = req.body;
    let paymentAmount = Number(amount);

    if ((!distributorId && !saleId) || !paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({ error: "Valid distributor/sale and amount required." });
    }

    if (saleId) {
      const sale = await Sale.findById(saleId);
      if (!sale || sale.balance <= 0) return res.status(400).json({ error: "Invalid sale or no balance." });
      
      let appliedAmount = paymentAmount;
      if (appliedAmount >= sale.balance) appliedAmount = sale.balance;

      sale.paidAmount += appliedAmount;
      sale.balance -= appliedAmount;
      sale.paymentStatus = sale.balance === 0 ? 'Paid' : 'Partially Paid';
      
      if (!sale.payments) sale.payments = [];
      sale.payments.push({ amount: appliedAmount, date: new Date() });
      
      await sale.save();
      return res.status(200).json({ message: "Sale payment recorded successfully", remainingPaymentAmount: paymentAmount - appliedAmount });
    }

    // Existing generic behavior
    const debts = await Sale.find({ 
      distributor: distributorId, 
      isDebt: true, 
      balance: { $gt: 0 } 
    }).sort({ createdAt: 1 });

    if (!debts || debts.length === 0) {
      return res.status(400).json({ error: "No outstanding debt found for this distributor." });
    }

    for (let sale of debts) {
      if (paymentAmount <= 0) break;

      if (paymentAmount >= sale.balance) {
        paymentAmount -= sale.balance;
        sale.paidAmount += sale.balance;
        
        if (!sale.payments) sale.payments = [];
        sale.payments.push({ amount: sale.balance, date: new Date() });
        
        sale.balance = 0;
        sale.paymentStatus = 'Paid';
      } else {
        sale.paidAmount += paymentAmount;
        sale.balance -= paymentAmount;
        sale.paymentStatus = 'Partially Paid';
        
        if (!sale.payments) sale.payments = [];
        sale.payments.push({ amount: paymentAmount, date: new Date() });
        
        paymentAmount = 0;
      }
      await sale.save();
    }

    res.status(200).json({ message: "Payment recorded successfully", remainingPaymentAmount: paymentAmount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ↩️ Return Product
router.post("/return", async (req, res) => {
  try {
    const { saleId, returnQuantity } = req.body;
    const qty = Number(returnQuantity);

    if (!saleId || !qty || qty <= 0) {
      return res.status(400).json({ error: "Valid sale ID and return quantity required." });
    }

    const sale = await Sale.findById(saleId);
    if (!sale) return res.status(404).json({ error: "Sale not found." });

    if (qty > (sale.quantity - sale.returnedQuantity)) {
      return res.status(400).json({ error: "Return quantity exceeds purchased amount." });
    }

    // Calculate reduction in price and BV
    const pricePerUnit = sale.price;
    const bvPerUnit = sale.bv;
    
    const valueReduction = pricePerUnit * qty;
    const bvReduction = bvPerUnit * qty;

    if (valueReduction > sale.balance) {
      return res.status(400).json({ error: "Return value exceeds unpaid balance (no refunds allowed)." });
    }

    sale.returnedQuantity += qty;
    sale.quantity -= qty;
    sale.totalPrice -= valueReduction;
    sale.totalBV -= bvReduction;
    
    if (sale.isDebt) {
        sale.balance -= valueReduction;
    }

    if (sale.quantity === 0) {
        sale.paymentStatus = 'Returned';
    } else if (sale.balance === 0) {
        sale.paymentStatus = 'Paid';
    } else if (sale.balance < sale.totalPrice) {
        sale.paymentStatus = 'Partially Paid';
    } else {
        sale.paymentStatus = 'Not Paid';
    }

    await sale.save();

    // Restore Stock
    const product = await Stock.findOne({ name: sale.product });
    if (product) {
      product.quantity += qty;
      await product.save();
    }

    res.status(200).json({ message: "Return processed successfully", sale });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
