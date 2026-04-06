import pool from "./pool.js";

async function initDB() {
  const client = await pool.connect();

  try {
    console.log("🚀 Initializing database tables...");

    // OTP table - mobile number verify panna
    await client.query(`
      CREATE TABLE IF NOT EXISTS otp_verifications (
        id SERIAL PRIMARY KEY,
        mobile VARCHAR(15) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Customers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        mobile VARCHAR(15) UNIQUE NOT NULL,
        address TEXT,
        is_mobile_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(50) UNIQUE NOT NULL,
        customer_id INTEGER REFERENCES customers(id),
        customer_name VARCHAR(100) NOT NULL,
        customer_mobile VARCHAR(15) NOT NULL,
        customer_address TEXT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'delivered', 'cancelled')),
        payment_method VARCHAR(20) DEFAULT 'cod',
        is_otp_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Order items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id VARCHAR(20) NOT NULL,
        product_name VARCHAR(100) NOT NULL,
        category VARCHAR(50),
        price DECIMAL(10,2) NOT NULL,
        quantity INTEGER NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Index for faster queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_mobile ON orders(customer_mobile);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_otp_mobile ON otp_verifications(mobile);
      CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
    `);

    console.log("✅ All tables created successfully!");
    console.log("📋 Tables: otp_verifications, customers, orders, order_items");
  } catch (err) {
    console.error("❌ DB init error:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

initDB();
