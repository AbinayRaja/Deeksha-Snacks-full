import express from "express";
import { sendOTP, verifyOTP } from "../services/otpService.js";

const router = express.Router();

// POST /api/otp/send - Send OTP to mobile
router.post("/send", async (req, res) => {
  const { mobile } = req.body;

  if (!mobile || !/^\d{10}$/.test(mobile)) {
    return res.status(400).json({
      success: false,
      message: "Valid 10-digit mobile number required",
    });
  }

  try {
    const result = await sendOTP(mobile);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/otp/verify - Verify OTP
router.post("/verify", async (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({
      success: false,
      message: "Mobile and OTP are required",
    });
  }

  try {
    const result = await verifyOTP(mobile, otp);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
