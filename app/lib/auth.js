import { query } from './db'; // 🚀 ফিক্সড: db থেকে সরাসরি আমাদের গ্লোবাল query ফাংশনটি ইম্পোর্ট করা হলো
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

const SESSION_EXPIRY_HOURS = 24;

// Session management
export async function createSession(userId) {
  const sessionToken = uuidv4(); 
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_EXPIRY_HOURS);

  try {
    // 🛠️ ফিক্সড: ম্যানুয়াল কানেকশন বাদ দিয়ে সরাসরি query() ব্যবহার করা হয়েছে
    await query(
      'INSERT INTO "Session" ("sessionToken", "userId", "expires") VALUES ($1, $2, $3)',
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
    console.error("Failed to create session:", error);
    throw error;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token')?.value;
  if (!sessionToken) return null;

  try {
    // 🛠️ ফিক্সড: সরাসরি গ্লোবাল query() ফাংশন ব্যবহার
    const result = await query(
      `SELECT u."id", u."username", u."email" 
       FROM "Session" s
       JOIN "user" u ON s."userId" = u."id"
       WHERE s."sessionToken" = $1 AND s."expires" > NOW()`,
      [sessionToken]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token')?.value;
  if (!sessionToken) return;

  try {
    // 🛠️ ফিক্সড: সরাসরি গ্লোবাল query() ফাংশন ব্যবহার
    await query(
      'DELETE FROM "Session" WHERE "sessionToken" = $1',
      [sessionToken]
    );
    cookieStore.delete('session_token');
  } catch (error) {
    console.error("Failed to delete session:", error);
    throw error;
  }
}