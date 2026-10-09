import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("❌ DATABASE_URL পাওয়া যায়নি! দয়া করে .env.local ফাইল চেক করুন।");
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Neon ডেটাবেজের জন্য এটি বাধ্যতামূলক
  },
});

export const query = (text, params) => pool.query(text, params);