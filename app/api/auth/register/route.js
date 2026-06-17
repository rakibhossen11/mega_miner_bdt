import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import bcrypt from "bcryptjs";

// Helper function to generate a secure random 5-digit number
function generateFiveDigitId() {
  return Math.floor(10000 + Math.random() * 90000); // Generates between 10000 and 99999
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, password, referralCode } = body;

    // ১. ফিল্ড ভ্যালিডেশন চেক
    if (!username || !email || !password) {
      return NextResponse.json({ success: false, error: "All required fields must be filled." }, { status: 400 });
    }

    const sanitizedUsername = username.trim().toLowerCase();
    const sanitizedEmail = email.trim().toLowerCase();

    // ২. সিকিউরিটি চেক: ইউজারনেম বা ইমেইল অলরেডি ডাটাবেসে আছে কিনা
    const checkUserQuery = "SELECT id FROM users WHERE username = $1 OR email = $2";
    const existingUserRes = await query(checkUserQuery, [sanitizedUsername, sanitizedEmail]);

    if (existingUserRes.rows.length > 0) {
      return NextResponse.json({ success: false, error: "Username or Email already registered." }, { status: 400 });
    }

    // ৩. লুপ চালিয়ে ইউনিক ৫-ডিজিটের আইডি নিশ্চিত করা
    let uniqueId = generateFiveDigitId();
    let idExists = true;
    
    while (idExists) {
      const checkIdQuery = "SELECT id FROM users WHERE id = $1";
      const idRes = await query(checkIdQuery, [uniqueId]);
      if (idRes.rows.length === 0) {
        idExists = false; // ইউনিক আইডি পাওয়া গেছে, লুপ ব্রেক
      } else {
        uniqueId = generateFiveDigitId(); // কলিশন হলে আবার জেনারেট হবে
      }
    }

    // ৪. রেফারেল ভ্যালিডেশন (আইডি ভিত্তিক ট্র্যাকিং)
    let finalReferrerId = null;
    let finalReferrerName = null;

    if (referralCode && referralCode.trim() !== "") {
      const cleanRefCode = referralCode.trim().toLowerCase();

      if (cleanRefCode === sanitizedUsername) {
        return NextResponse.json({ success: false, error: "You cannot refer yourself." }, { status: 400 });
      }

      // রেফারারের আইডি এবং নাম দুটোই তুলে আনছি
      const referrerCheckQuery = "SELECT id, username FROM users WHERE username = $1";
      const referrerRes = await query(referrerCheckQuery, [cleanRefCode]);

      if (referrerRes.rows.length === 0) {
        return NextResponse.json({ success: false, error: "Invalid referral code. Referrer not found." }, { status: 400 });
      }

      finalReferrerId = referrerRes.rows[0].id;        // রেফারারের ৫-ডিজিট আইডি সংখ্যা
      finalReferrerName = referrerRes.rows[0].username; // রেফারারের টেক্সট নাম
    }

    // ৫. সিকিউর পাসওয়ার্ড হ্যাশিং (bcryptjs)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ৬. মূল `users` টেবিলে ডেটা ইনসার্ট (referred_by কলামে এখন রেফারারের আইডি যাচ্ছে)
    const insertQuery = `
      INSERT INTO users (id, username, email, password_hash, referred_by) 
      VALUES ($1, $2, $3, $4, $5)
    `;
    await query(insertQuery, [uniqueId, sanitizedUsername, sanitizedEmail, hashedPassword, finalReferrerId]);

    // =========================================================================
    // 🎛️ ওয়ালেট ব্যালেন্স এবং রেফারেল বোনাস আপডেট প্রসেস (ID Based)
    // =========================================================================
    let startupCoinBalance = 0; 
    const REFERRER_BONUS = 500; // যে রেফার করেছে সে পাবে +৫০০ কয়েন
    const REFERRED_BONUS = 1000;  // যে নতুন জয়েন করলো সে পাবে +১০০০ কয়েন

    if (finalReferrerId && finalReferrerName) {
      
      // ক) হিস্ট্রির জন্য referral_earnings টেবিলে পার্মানেন্ট এন্ট্রি
      const insertHistorySQL = `
        INSERT INTO referral_earnings (
          referrer_id, referrer_username, 
          referred_id, referred_username, 
          referrer_bonus_coins, referred_bonus_coins
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `;
      await query(insertHistorySQL, [
        finalReferrerId, finalReferrerName, 
        uniqueId, sanitizedUsername, 
        REFERRER_BONUS, REFERRED_BONUS
      ]);

      // খ) রেফারার ইউজারের মেইন ওয়ালেটে (user_wallets) টোটাল কয়েনের সাথে ৫০০ যোগ করা
      const updateReferrerWalletSQL = `
        UPDATE user_wallets 
        SET total_coin = total_coin + $1, updated_at = NOW()
        WHERE user_id = $2
      `;
      await query(updateReferrerWalletSQL, [REFERRER_BONUS, finalReferrerId]);

      // গ) নতুন ইউজারের ওয়ান-টাইম সাইন-আপ গিফট ব্যালেন্স ১০০ সেট করা
      startupCoinBalance = REFERRED_BONUS;
    }

    // ঘ) নতুন ইউজারের জন্য মেইন ওয়ালেট রো ক্রিয়েট করা (user_wallets)
    // রেফারে আসলে ১০০০ কয়েন পাবে, ডিরেক্ট আসলে ০ কয়েন পাবে।
    const createWalletSQL = `
      INSERT INTO user_wallets (user_id, user_email, total_coin, total_dollar)
      VALUES ($1, $2, $3, 0.00)
    `;
    await query(createWalletSQL, [uniqueId, sanitizedEmail, startupCoinBalance]);
    // =========================================================================

    return NextResponse.json({ success: true, message: "Account setup complete!" }, { status: 201 });

  } catch (error) {
    console.error("PostgreSQL Custom ID Registration Error:", error);
    return NextResponse.json({ success: false, error: "Internal Database Server Error." }, { status: 500 });
  }
}

// import { NextResponse } from "next/server";
// import { query } from "@/app/lib/db";
// import bcrypt from "bcryptjs";

// // Helper function to generate a secure random 5-digit number
// function generateFiveDigitId() {
//   return Math.floor(10000 + Math.random() * 90000); // Generates between 10000 and 99999
// }

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const { username, email, password, referralCode } = body;

//     if (!username || !email || !password) {
//       return NextResponse.json({ success: false, error: "All required fields must be filled." }, { status: 400 });
//     }

//     const sanitizedUsername = username.trim().toLowerCase();
//     const sanitizedEmail = email.trim().toLowerCase();

//     // 1. Security Check: Verify if username or email already exists
//     const checkUserQuery = "SELECT id FROM users WHERE username = $1 OR email = $2";
//     const existingUserRes = await query(checkUserQuery, [sanitizedUsername, sanitizedEmail]);

//     if (existingUserRes.rows.length > 0) {
//       return NextResponse.json({ success: false, error: "Username or Email already registered." }, { status: 400 });
//     }

//     // 2. Loop to ensure the generated 5-digit ID is completely unique in database
//     let uniqueId = generateFiveDigitId();
//     let idExists = true;
    
//     while (idExists) {
//       const checkIdQuery = "SELECT id FROM users WHERE id = $1";
//       const idRes = await query(checkIdQuery, [uniqueId]);
//       if (idRes.rows.length === 0) {
//         idExists = false; // Unique ID found, break loop
//       } else {
//         uniqueId = generateFiveDigitId(); // Regenerate if collision happens
//       }
//     }

//     // 3. Referral Validation against existing database records
//     let finalReferrer = null;
//     let referrerId = null; // নতুন যোগ করা হয়েছে হিস্ট্রি টেবিলের জন্য

//     if (referralCode && referralCode.trim() !== "") {
//       const cleanRefCode = referralCode.trim().toLowerCase();

//       if (cleanRefCode === sanitizedUsername) {
//         return NextResponse.json({ success: false, error: "You cannot refer yourself." }, { status: 400 });
//       }

//       // ID-ও সাথে সিলেক্ট করছি যাতে referral_earnings টেবিলে বসানো যায়
//       const referrerCheckQuery = "SELECT id, username FROM users WHERE username = $1";
//       const referrerRes = await query(referrerCheckQuery, [cleanRefCode]);

//       if (referrerRes.rows.length === 0) {
//         return NextResponse.json({ success: false, error: "Invalid referral code. Referrer not found." }, { status: 400 });
//       }

//       finalReferrer = referrerRes.rows[0].username;
//       referrerId = referrerRes.rows[0].id;
//     }

//     // 4. Secure Password Hashing
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // 5. Insert secure payload into PostgreSQL (Original User Table)
//     const insertQuery = `
//       INSERT INTO users (id, username, email, password_hash, referred_by) 
//       VALUES ($1, $2, $3, $4, $5)
//     `;
//     await query(insertQuery, [uniqueId, sanitizedUsername, sanitizedEmail, hashedPassword, finalReferrer]);

//     // =========================================================================
//     // 🆕 নতুন ওয়ালেট এবং রেফারেল বোনাস সিস্টেম কানেকশন (New Integration)
//     // =========================================================================
//     let startupCoinBalance = 0.0000; 
//     const REFERRER_BONUS = 500; // যে রেফার করেছে সে পাবে ৫০০ কয়েন
//     const REFERRED_BONUS = 1000;  // যে নতুন জয়েন করলো সে পাবে ১০০০ কয়েন

//     // যদি ইউজার সাকসেসফুলি কোনো রেফারেলে জয়েন করে থাকে
//     if (finalReferrer && referrerId) {
      
//       // ক) আলাদা হিস্ট্রি টেবিল (referral_earnings)-এ রেকর্ড ইনসার্ট করা
//       const insertHistorySQL = `
//         INSERT INTO referral_earnings (
//           referrer_id, referrer_username, 
//           referred_id, referred_username, 
//           referrer_bonus_coins, referred_bonus_coins
//         ) VALUES ($1, $2, $3, $4, $5, $6)
//       `;
//       await query(insertHistorySQL, [
//         referrerId, finalReferrer,       // রেফারার ডেটা
//         uniqueId, sanitizedUsername,     // নতুন ইউজারের ৫-ডিজিট আইডি ও নাম
//         REFERRER_BONUS, REFERRED_BONUS   // রেট বোনাস
//       ]);

//       // খ) যে রেফার করেছে তার মেইন ওয়ালেটে (user_wallets) ইনস্ট্যান্ট +৫০০ কয়েন যোগ করা
//       const updateReferrerWalletSQL = `
//         UPDATE user_wallets 
//         SET coin_balance = coin_balance + $1, updated_at = NOW()
//         WHERE user_id = $2
//       `;
//       await query(updateReferrerWalletSQL, [REFERRER_BONUS, referrerId]);

//       // গ) নতুন ইউজারের স্টার্টিং ব্যালেন্স ১০০ সেট করা
//       startupCoinBalance = REFERRED_BONUS;
//     }

//     // ঘ) ফাইনাল সাব-স্টেপ: নতুন ইউজারের নিজস্ব ওয়ালেট অ্যাকাউন্ট তৈরি করা (user_wallets)
//     const createWalletSQL = `
//       INSERT INTO user_wallets (user_id, user_email, coin_balance, dollar_balance)
//       VALUES ($1, $2, $3, 0.00)
//     `;
//     await query(createWalletSQL, [uniqueId, sanitizedEmail, startupCoinBalance]);
//     // =========================================================================

//     return NextResponse.json({ success: true, message: "Account setup complete!" }, { status: 201 });

//   } catch (error) {
//     console.error("PostgreSQL Custom ID Registration Error:", error);
//     return NextResponse.json({ success: false, error: "Internal Database Server Error." }, { status: 500 });
//   }
// }


// import { NextResponse } from "next/server";
// import { query } from "@/app/lib/db";
// import bcrypt from "bcryptjs";

// // Helper function to generate a secure random 5-digit number
// function generateFiveDigitId() {
//   return Math.floor(10000 + Math.random() * 90000); // Generates between 10000 and 99999
// }

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const { username, email, password, referralCode } = body;

//     if (!username || !email || !password) {
//       return NextResponse.json({ success: false, error: "All required fields must be filled." }, { status: 400 });
//     }

//     const sanitizedUsername = username.trim().toLowerCase();
//     const sanitizedEmail = email.trim().toLowerCase();

//     // 1. Security Check: Verify if username or email already exists
//     const checkUserQuery = "SELECT id FROM users WHERE username = $1 OR email = $2";
//     const existingUserRes = await query(checkUserQuery, [sanitizedUsername, sanitizedEmail]);

//     if (existingUserRes.rows.length > 0) {
//       return NextResponse.json({ success: false, error: "Username or Email already registered." }, { status: 400 });
//     }

//     // 2. Loop to ensure the generated 5-digit ID is completely unique in database
//     let uniqueId = generateFiveDigitId();
//     let idExists = true;
    
//     while (idExists) {
//       const checkIdQuery = "SELECT id FROM users WHERE id = $1";
//       const idRes = await query(checkIdQuery, [uniqueId]);
//       if (idRes.rows.length === 0) {
//         idExists = false; // Unique ID found, break loop
//       } else {
//         uniqueId = generateFiveDigitId(); // Regenerate if collision happens
//       }
//     }

//     // 3. Referral Validation against existing database records
//     let finalReferrer = null;
//     if (referralCode && referralCode.trim() !== "") {
//       const cleanRefCode = referralCode.trim().toLowerCase();

//       if (cleanRefCode === sanitizedUsername) {
//         return NextResponse.json({ success: false, error: "You cannot refer yourself." }, { status: 400 });
//       }

//       const referrerCheckQuery = "SELECT username FROM users WHERE username = $1";
//       const referrerRes = await query(referrerCheckQuery, [cleanRefCode]);

//       if (referrerRes.rows.length === 0) {
//         return NextResponse.json({ success: false, error: "Invalid referral code. Referrer not found." }, { status: 400 });
//       }

//       finalReferrer = referrerRes.rows[0].username;
//     }

//     // 4. Secure Password Hashing
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // 5. Insert secure payload into PostgreSQL
//     const insertQuery = `
//       INSERT INTO users (id, username, email, password_hash, referred_by) 
//       VALUES ($1, $2, $3, $4, $5)
//     `;
//     await query(insertQuery, [uniqueId, sanitizedUsername, sanitizedEmail, hashedPassword, finalReferrer]);

//     return NextResponse.json({ success: true, message: "Account setup complete!" }, { status: 201 });

//   } catch (error) {
//     console.error("PostgreSQL Custom ID Registration Error:", error);
//     return NextResponse.json({ success: false, error: "Internal Database Server Error." }, { status: 500 });
//   }
// }