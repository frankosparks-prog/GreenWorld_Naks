const express = require("express");
const router = express.Router();
const parser = require("../middleware/cloudinaryUpload");

// Upload image only (for preview or temp use)
router.post("/image", parser.single("image"), (req, res) => {
  try {
    if (!req.file) throw new Error("No file uploaded");

    res.status(200).json({
      success: true,
      imageUrl: req.file.path,
      public_id: req.file.filename,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
