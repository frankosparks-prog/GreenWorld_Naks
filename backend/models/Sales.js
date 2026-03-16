const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    distributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Distributor",
      required: true,
    },
    product: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    bv: {
      type: Number,
      required: true,
    },
    totalBV: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Partially Paid', 'Not Paid', 'Returned'],
      default: 'Paid'
    },
    paidAmount: {
      type: Number,
      default: function() {
        return this.isDebt ? 0 : this.totalPrice;
      }
    },
    balance: {
      type: Number,
      default: function() {
        return this.isDebt ? this.totalPrice : 0;
      }
    },
    isDebt: {
      type: Boolean,
      default: false
    },
    returnedQuantity: {
      type: Number,
      default: 0
    },
    transactionId: {
      type: String
    },
    payments: [{
      amount: Number,
      date: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", saleSchema);