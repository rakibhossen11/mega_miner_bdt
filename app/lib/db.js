import { Pool } from "pg";

// PostgreSQL credentials from environment variables for security
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "12345678",
  database: process.env.DB_NAME || "mega_miner_bdt",
  port: parseInt(process.env.DB_PORT || "5432"),
//   max: 20, // Maximum client connections in the pool
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 2000,
});

// A global query function to handle connection pooling automatically
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // Useful for development debugging
    console.log("Executed Query:", { text, duration: `${duration}ms`, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error("Database Query Error:", error);
    throw error;
  }
};

export default pool;