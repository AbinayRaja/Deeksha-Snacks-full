import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import otpRoutes from "./routes/otp.js";
import orderRoutes from "./routes/orders.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api/otp", otpRoutes);
app.use("/api/orders", orderRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Deeksha Snacks API running 🍿" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Deeksha Snacks Backend running on http://localhost:${PORT}`);
  console.log(`📋 API Endpoints:`);
  console.log(`   POST /api/otp/send      - Send OTP`);
  console.log(`   POST /api/otp/verify    - Verify OTP`);
  console.log(`   POST /api/orders        - Place order`);
  console.log(`   GET  /api/orders        - All orders (admin)`);
  console.log(`   GET  /api/orders/:id    - Single order`);
  console.log(`   PATCH /api/orders/:id/status - Update status`);
});
