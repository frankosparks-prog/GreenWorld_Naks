const express = require('express');
const router = express.Router();
const Sale = require('../models/Sales');
const Stock = require('../models/Stock');

// 📊 Get General Analytics Summary
router.get('/summary', async (req, res) => {
  try {
    const totalSales = await Sale.countDocuments();
    
    // Aggregations for Sales Data
    const salesAgg = await Sale.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          actualRevenue: { $sum: "$paidAmount" },
          pendingDebt: { $sum: "$balance" },
          totalBV: { $sum: "$totalBV" },
          totalQuantitySold: { $sum: "$quantity" }
        }
      }
    ]);

    const revStats = salesAgg[0] || { totalRevenue: 0, actualRevenue: 0, pendingDebt: 0, totalBV: 0, totalQuantitySold: 0 };

    // Stock Data
    const stockStats = await Stock.aggregate([
      {
        $group: {
           _id: null,
           totalStockItems: { $sum: "$quantity" }
        }
      }
    ]);
    
    const stockItems = stockStats[0] ? stockStats[0].totalStockItems : 0;

    // Top Selling Products
    const topProducts = await Sale.aggregate([
      {
        $group: {
          _id: "$product",
          quantitySold: { $sum: "$quantity" },
          revenue: { $sum: "$totalPrice" },
          bv: { $sum: "$totalBV" }
        }
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 5 }
    ]);
    
    // Low Stock Alerts
    const lowStock = await Stock.find({ quantity: { $lte: 10 } }).select("name quantity").lean();

    // Recent Sales
    const recentSales = await Sale.find()
      .populate("distributor", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({
      totalSales,
      totalRevenue: revStats.totalRevenue,
      actualRevenue: revStats.actualRevenue,
      pendingDebt: revStats.pendingDebt,
      totalBV: revStats.totalBV,
      totalQuantitySold: revStats.totalQuantitySold,
      totalStockItems: stockItems,
      topProducts,
      lowStock,
      recentSales
    });

  } catch (err) {
    console.error("Analytics Error:", err);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
});

module.exports = router;
