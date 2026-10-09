// app/lib/auth.js
import { query } from './db';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

const SESSION_EXPIRY_HOURS = 24;

/**
 * 📥 সেশন তৈরি করা (Create Session)
 * সঠিক UUID ইউজার আইডির সাথে 'session_token' এবং 'expires' সেভ করা হয়
 */
export async function createSession(userId) {
  const sessionToken = uuidv4(); 
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_EXPIRY_HOURS);

  try {
    await query(
      'INSERT INTO "Session" ("session_token", "user_id", "expires") VALUES ($1, $2, $3)',
      [sessionToken, userId, expiresAt]
    );

    const cookieStore = await cookies();
    cookieStore.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return sessionToken;
  } catch (error) {
    console.error("Failed to create secure session:", error);
    throw error;
  }
}

/**
 * 📤 সেশন ডাটা রিড করা (Get Session)
 * Session টেবিলের সাথে users এবং user_wallets টেবিল জয়েন করে কমপ্লিট ইউজার ও ওয়ালেট ডাটা আনা হয়েছে
 */
export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token')?.value;
  if (!sessionToken) return null;

  try {
    const result = await query(
      `SELECT 
        s."session_id" AS "sessionId", 
        s."session_token" AS "sessionToken", 
        s."expires" AS "sessionExpires", 
        u."id" AS "id", 
        u."username", 
        u."user_email" AS "email",
        COALESCE(w."total_coin", 0) AS "totalCoin",
        COALESCE(w."total_dollar", 0) AS "totalDollar",
        COALESCE(w."mining_wallet", 0) AS "miningWallet",
        w."mining_speed" AS "miningSpeed"
       FROM "Session" s
       JOIN "users" u ON s."user_id" = u."id"
       LEFT JOIN "user_wallets" w ON u."id" = w."user_id"
       WHERE s."session_token" = $1 AND s."expires" > NOW()`,
      [sessionToken]
    );

    if (result.rows.length > 0) {
      return result.rows[0]; // সরাসরি { id, username, email, totalCoin... } অবজেক্ট রিটার্ন করবে
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch secure session from Postgres:", error);
    return null;
  }
}

/**
 * ❌ সেশন ডিলিট করা (Delete Session / Logout)
 */
export async function deleteSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token')?.value;
  if (!sessionToken) return;

  try {
    await query(
      'DELETE FROM "Session" WHERE "session_token" = $1',
      [sessionToken]
    );
    cookieStore.delete('session_token');
  } catch (error) {
    console.error("Failed to purge session from system:", error);
    throw error;
  }
}