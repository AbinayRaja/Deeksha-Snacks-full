import twilio from "twilio";
import pool from "../db/pool.js";
import dotenv from "dotenv";

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Generate 6 digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP to mobile number
export async function sendOTP(mobile) {
  const dbClient = await pool.connect();

  try {
    // Delete any existing OTP for this mobile
    await dbClient.query(
      "DELETE FROM otp_verifications WHERE mobile = $1",
      [mobile]
    );

    const otp = generateOTP();

    // OTP expires in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save OTP to DB
    await dbClient.query(
      `INSERT INTO otp_verifications (mobile, otp, expires_at)
       VALUES ($1, $2, $3)`,
      [mobile, otp, expiresAt]
    );

    // Send SMS via Twilio
    await client.messages.create({
      body: `🛍️ Deeksha Snacks - Your OTP is: ${otp}. Valid for 5 minutes. Do not share this with anyone.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${mobile}`, // India number
    });

    console.log(`📱 OTP sent to ${mobile}: ${otp}`);
    return { success: true, message: "OTP sent successfully" };
  } catch (err) {
    console.error("❌ OTP send error:", err.message);
    throw new Error("Failed to send OTP. Check your mobile number.");
  } finally {
    dbClient.release();
  }
}

// Verify OTP
export async function verifyOTP(mobile, otp) {
  const dbClient = await pool.connect();

  try {
    const result = await dbClient.query(
      `SELECT * FROM otp_verifications
       WHERE mobile = $1 
         AND otp = $2 
         AND is_verified = FALSE
         AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [mobile, otp]
    );

    if (result.rows.length === 0) {
      return { success: false, message: "Invalid or expired OTP" };
    }

    // Mark OTP as verified
    await dbClient.query(
      "UPDATE otp_verifications SET is_verified = TRUE WHERE id = $1",
      [result.rows[0].id]
    );

    return { success: true, message: "OTP verified successfully" };
  } catch (err) {
    console.error("❌ OTP verify error:", err.message);
    throw new Error("OTP verification failed");
  } finally {
    dbClient.release();
  }
}
