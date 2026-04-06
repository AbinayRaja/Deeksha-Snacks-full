import express from "express";
import { v4 as uuidv4 } from "uuid";
import pool from "../db/pool.js";
import { verifyOTP } from "../services/otpService.js";

const router = express.Router();

// POST /api/orders - Place new order (with OTP verify)
router.post("/", async (req, res) => {
  const { customerName, customerMobile, customerAddress, items, otp } = req.body;

  // Validate required fields
  if (!customerName || !customerMobile || !customerAddress || !items || !otp) {
    return res.status(400).json({
      success: false,
      message: "All fields required: name, mobile, address, items, otp",
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty" });
  }

  // Verify OTP before placing order
  const otpResult = await verifyOTP(customerMobile, otp);
  if (!otpResult.success) {
    return res.status(400).json({ success: false, message: "OTP verification failed. Invalid or expired OTP." });
  }

  const dbClient = await pool.connect();

  try {
    await dbClient.query("BEGIN");

    // Calculate total
    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const orderId = `DS-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`;

    // Upsert customer
    const customerResult = await dbClient.query(
      `INSERT INTO customers (name, mobile, address, is_mobile_verified)
       VALUES ($1, $2, $3, TRUE)
       ON CONFLICT (mobile) DO UPDATE
         SET name = EXCLUDED.name,
             address = EXCLUDED.address,
             is_mobile_verified = TRUE
       RETURNING id`,
      [customerName, customerMobile, customerAddress]
    );

    const customerId = customerResult.rows[0].id;

    // Insert order
    const orderResult = await dbClient.query(
      `INSERT INTO orders 
         (order_id, customer_id, customer_name, customer_mobile, customer_address, total_amount, is_otp_verified, status)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE, 'confirmed')
       RETURNING *`,
      [orderId, customerId, customerName, customerMobile, customerAddress, totalAmount]
    );

    const order = orderResult.rows[0];

    // Insert order items
    for (const item of items) {
      const subtotal = item.price * item.quantity;
      await dbClient.query(
        `INSERT INTO order_items (order_id, product_id, product_name, category, price, quantity, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [order.id, item.id, item.name, item.category || "", item.price, item.quantity, subtotal]
      );
    }

    await dbClient.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: {
        orderId: order.order_id,
        status: order.status,
        totalAmount: order.total_amount,
        customerName: order.customer_name,
        customerMobile: order.customer_mobile,
        customerAddress: order.customer_address,
        createdAt: order.created_at,
      },
    });
  } catch (err) {
    await dbClient.query("ROLLBACK");
    console.error("❌ Order error:", err.message);
    res.status(500).json({ success: false, message: "Failed to place order" });
  } finally {
    dbClient.release();
  }
});

// GET /api/orders - Get all orders (Admin)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, 
         json_agg(
           json_build_object(
             'productId', oi.product_id,
             'productName', oi.product_name,
             'category', oi.category,
             'price', oi.price,
             'quantity', oi.quantity,
             'subtotal', oi.subtotal
           )
         ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       GROUP BY o.id
       ORDER BY o.created_at DESC`
    );

    res.json({ success: true, orders: result.rows });
  } catch (err) {
    console.error("❌ Get orders error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

// GET /api/orders/:orderId - Get single order
router.get("/:orderId", async (req, res) => {
  const { orderId } = req.params;

  try {
    const orderResult = await pool.query(
      "SELECT * FROM orders WHERE order_id = $1",
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const itemsResult = await pool.query(
      "SELECT * FROM order_items WHERE order_id = $1",
      [orderResult.rows[0].id]
    );

    res.json({
      success: true,
      order: { ...orderResult.rows[0], items: itemsResult.rows },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch order" });
  }
});

// PATCH /api/orders/:orderId/status - Update order status (Admin)
router.patch("/:orderId/status", async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const validStatuses = ["pending", "confirmed", "preparing", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  try {
    const result = await pool.query(
      `UPDATE orders SET status = $1, updated_at = NOW()
       WHERE order_id = $2 RETURNING *`,
      [status, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
});

export default router;
