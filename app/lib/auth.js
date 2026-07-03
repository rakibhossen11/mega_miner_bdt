// app/lib/auth.js
import { query } from './db';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

const SESSION_EXPIRY_HOURS = 24;

// 📥 সেশন তৈরি করা
export async function createSession(userId) {
  const sessionToken = uuidv4(); 
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_EXPIRY_HOURS);

  try {
    // 🛠️ ফিক্সড: "userId" এর বদলে এখন "user_id" ব্যবহার করা হয়েছে
    await query(
      'INSERT INTO "Session" ("sessionToken", "user_id", "expires") VALUES ($1, $2, $3)',
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

// 📤 সেশন ডাটা রিড করা (এখন একদম সহজ ও ক্লিন জয়েন)
// export async function getSession() {
//   const cookieStore = await cookies();
//   const sessionToken = cookieStore.get('session_token')?.value;
//   if (!sessionToken) return null;

//   try {
//     // 🚀 ফিক্সড কুয়েরি: s."user_id" এর সাথে w."user_id" সরাসরি ম্যাচ করানো হয়েছে
//     const result = await query(
//       `SELECT 
//         s."id" AS "sessionId", 
//         s."sessionToken", 
//         s."expires" AS "sessionExpires", 
//         w."user_id" AS "id", 
//         w."username", 
//         w."user_email" AS "email",
//         COALESCE(w."total_coin", 0) AS "totalCoin",
//         COALESCE(w."total_dollar", 0) AS "totalDollar",
//         COALESCE(w."mining_wallet", 0) AS "miningWallet",
//         w."mining_speed" AS "miningSpeed"
//        FROM "Session" s
//        JOIN "user_wallets" w ON s."user_id"::text = w."user_id"::text
//        WHERE s."sessionToken" = $1`, 
//       [sessionToken]
//     );

//     if (result.rows.length === 0) return null;

//     // টাইম এক্সপায়ারি চেক (কোড লেভেলে সেফটি)
//     const session = result.rows[0];
//     if (new Date(session.sessionExpires) < new Date()) {
//       return null;
//     }

//     return session;
//   } catch (error) {
//     console.error("Failed to get session:", error);
//     return null;
//   }
// }

export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token')?.value;
  if (!sessionToken) return null;
  // console.log("working");
  try {
    // 🚀 ফিক্সড কুয়েরি: s."userId" এবং w."user_id" এর চারপাশের ডাবল কোটেশন ক্লিন করে ম্যাচ করানো হলো
    const result = await query(
      `SELECT 
        s."id" AS "sessionId", 
        s."sessionToken", 
        s."expires" AS "sessionExpires", 
        w."user_id" AS "id", 
        w."username", 
        w."user_email" AS "email",
        COALESCE(w."total_coin", 0) AS "totalCoin",
        COALESCE(w."total_dollar", 0) AS "totalDollar",
        COALESCE(w."mining_wallet", 0) AS "miningWallet",
        w."mining_speed" AS "miningSpeed"
       FROM "Session" s
       JOIN "user_wallets" w ON REPLACE(s."user_id"::text, '"', '') = REPLACE(w."user_id"::text, '"', '')
       WHERE s."sessionToken" = $1 AND s."expires" > NOW()`,
      [sessionToken]
    );
    // console.log('auth page result',result);
    // console.log('auth page return',result.rows[0]);

    if (result.fields.length > 0) {
      return result.fields[0] || null;
    }

    return null;
  } catch (error) {
    console.error("Failed to get session from database architecture:", error);
    return null;
  }
}

// ❌ সেশন ডিলিট করা
export async function deleteSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token')?.value;
  if (!sessionToken) return;

  try {
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


// import { query } from './db'; // 🚀 ফিক্সড: db থেকে সরাসরি আমাদের গ্লোবাল query ফাংশনটি ইম্পোর্ট করা হলো
// import bcrypt from 'bcryptjs';
// import { v4 as uuidv4 } from 'uuid';
// import { cookies } from 'next/headers';

// const SESSION_EXPIRY_HOURS = 24;

// // Session management
// export async function createSession(userId) {
//   const sessionToken = uuidv4(); 
//   const expiresAt = new Date();
//   expiresAt.setHours(expiresAt.getHours() + SESSION_EXPIRY_HOURS);

//   try {
//     // 🛠️ ফিক্সড: ম্যানুয়াল কানেকশন বাদ দিয়ে সরাসরি query() ব্যবহার করা হয়েছে
//     await query(
//       'INSERT INTO "Session" ("sessionToken", "userId", "expires") VALUES ($1, $2, $3)',
//       [sessionToken, userId, expiresAt]
//     );

//     const cookieStore = await cookies();
//     cookieStore.set('session_token', sessionToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'lax',
//       expires: expiresAt,
//       path: '/',
//     });

//     return sessionToken;
//   } catch (error) {
//     console.error("Failed to create session:", error);
//     throw error;
//   }
// }

// // app/lib/auth.js
// // app/lib/auth.js
// export async function getSession() {
//   const cookieStore = await cookies();
//   const sessionToken = cookieStore.get('session_token')?.value;
  
//   console.log('auth page session token:', sessionToken);
//   if (!sessionToken) return null;

//   try {
//     // 🚀 ফিক্সড কুয়েরি: ৩টি টেবিল জয়েন করা হলো
//     // ১. প্রথমে Session টেবিলের userId দিয়ে "user" (ইউজার) টেবিলের id ম্যাচ করা হলো
//     // ২. তারপর "user" টেবিলের ইমেইল দিয়ে "user_wallets" টেবিলের ডাটা আনা হলো
//     const result = await query(
//       `SELECT 
//         s."id" AS "sessionId", 
//         s."sessionToken", 
//         s."expires" AS "sessionExpires", 
//         w."user_id" AS "id", 
//         w."username", 
//         w."user_email" AS "email",
//         COALESCE(w."total_coin", 0) AS "totalCoin",
//         COALESCE(w."total_dollar", 0) AS "totalDollar",
//         COALESCE(w."mining_wallet", 0) AS "miningWallet",
//         w."mining_speed" AS "miningSpeed"
//        FROM "Session" s
//        JOIN "users" u ON s."userId" = u."id"
//        JOIN "user_wallets" w ON LOWER(u."email") = LOWER(w."user_email")
//        WHERE s."sessionToken" = $1`, 
//       [sessionToken]
//     );

//     console.log('Database Result Rows:', result.rows);

//     if (result.rows.length === 0) {
//       console.log('⚠️ ওহো! সেশন টোকেন মিললেও ইউজার বা ওয়ালেট টেবিলের সাথে ডাটা লিঙ্ক হচ্ছে না।');
//       return null;
//     }

//     // 🕒 কোড লেভেলে টাইমজোন সেফটি এক্সপায়ারি চেক
//     const session = result.rows[0];
//     if (new Date(session.sessionExpires) < new Date()) {
//       console.log('❌ Session has expired!');
//       return null;
//     }

//     return session; // এটি সরাসরি রিডাক্সের জন্য { id, username, email, totalCoin... } রিটার্ন করবে
//   } catch (error) {
//     console.error("Failed to get session from database architecture:", error);
//     return null;
//   }
// }

// export async function deleteSession() {
//   const cookieStore = await cookies();
//   const sessionToken = cookieStore.get('session_token')?.value;
//   if (!sessionToken) return;

//   try {
//     // 🛠️ ফিক্সড: সরাসরি গ্লোবাল query() ফাংশন ব্যবহার
//     await query(
//       'DELETE FROM "Session" WHERE "sessionToken" = $1',
//       [sessionToken]
//     );
//     cookieStore.delete('session_token');
//   } catch (error) {
//     console.error("Failed to delete session:", error);
//     throw error;
//   }
// }