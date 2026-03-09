const express = require("express");
const axios = require("axios");
const router = express.Router();

const TEXTSMS_API_KEY = process.env.TEXTSMS_API_KEY;
const PARTNER_ID      = process.env.PARTNER_ID      || "14661";
const SENDER_ID       = process.env.SENDER_ID       || "TextSMS";

// POST /api/sms/send-sms
router.post("/send-sms", async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ success: false, error: "Missing phone or message" });
  }

  try {
    // The TextSMS Kenya API typically expects an application/x-www-form-urlencoded body
    const params = new URLSearchParams({
      apikey: TEXTSMS_API_KEY,
      partnerID: PARTNER_ID,
      shortcode: SENDER_ID,
      mobile: phone,
      message,
    });

    const response = await axios.post(
      "https://sms.textsms.co.ke/api/services/sendsms/",
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // The provider will send back JSON or XML. We simply forward it to the client.
    return res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error("SMS Error:", error.response?.data || error.message);
    return res.status(500).json({ success: false, error: "Failed to send SMS" });
  }
});

module.exports = router;
  