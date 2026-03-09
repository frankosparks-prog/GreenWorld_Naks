const mongoose = require("mongoose");

const MassageSchema = new mongoose.Schema(
  {
    serviceType: {
      type: String,
      required: true,
      enum: ["Full Body Massage", "Half Body Massage", "Pedicure", "Screening"], // Add more as needed
    },
    price: {
      type: Number,
      required: true,
    },
    salesAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assumes your user model is named 'User'
      required: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Massage", MassageSchema);