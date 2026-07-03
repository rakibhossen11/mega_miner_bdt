// app/api/auth/register/route.js
import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import bcrypt from "bcryptjs";
import { createSession } from "@/app/lib/auth"; // 🔐 অটো-লগইনের জন্য সেশন মেথড

// ৫-ডিজিটের ইউনিক ইউজার আইডি জেনারেটর
function generateFiveDigitId() {
  return Math.floor(10000 + Math.random() * 90000); // 10000 থেকে 99999
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
    const checkUserQuery = 'SELECT "user_id" FROM "users" WHERE "username" = $1 OR "user_email" = $2';
    const existingUserRes = await query(checkUserQuery, [sanitizedUsername, sanitizedEmail]);

    if (existingUserRes.rows.length > 0) {
      return NextResponse.json({ success: false, error: "Username or Email already registered." }, { status: 400 });
    }

    // ৩. ইউনিক ৫-ডিজিটের user_id নিশ্চিত করা
    let uniqueUserId = generateFiveDigitId();
    let idExists = true;
    
    while (idExists) {
      const checkIdQuery = 'SELECT "user_id" FROM "users" WHERE "user_id" = $1';
      const idRes = await query(checkIdQuery, [uniqueUserId]);
      if (idRes.rows.length === 0) {
        idExists = false; 
      } else {
        uniqueUserId = generateFiveDigitId(); 
      }
    }

    // ৪. রেফারেল ভ্যালিডেশন (নতুন কলাম 'user_id' ভিত্তিক)
    let finalReferrerId = null;
    let finalReferrerName = null;

    if (referralCode && referralCode.trim() !== "") {
      const cleanRefCode = referralCode.trim().toLowerCase();

      if (cleanRefCode === sanitizedUsername) {
        return NextResponse.json({ success: false, error: "You cannot refer yourself." }, { status: 400 });
      }

      // রেফারারের user_id এবং username তুলে আনা
      const referrerCheckQuery = 'SELECT "user_id", "username" FROM "users" WHERE "username" = $1';
      const referrerRes = await query(referrerCheckQuery, [cleanRefCode]);

      if (referrerRes.rows.length === 0) {
        return NextResponse.json({ success: false, error: "Invalid referral code. Referrer not found." }, { status: 400 });
      }

      finalReferrerId = referrerRes.rows[0].user_id;        
      finalReferrerName = referrerRes.rows[0].username; 
    }

    // ৫. সিকিউর পাসওয়ার্ড হ্যাশিং (bcryptjs)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // -- ৬. মূল `users` টেবিলে ডেটা ইনসার্ট
    const insertQuery = `
      INSERT INTO "users" ("user_id", "username", "user_email", "password_hash", "referred_by") 
      VALUES ($1, $2, $3, $4, $5)
    `;
    await query(insertQuery, [uniqueUserId, sanitizedUsername, sanitizedEmail, hashedPassword, finalReferrerId]);

    // =========================================================================
    // 🎛️ ওয়ালেট তৈরি এবং রেফারেল বোনাস মেকানিজম (নতুন টেবিল লজিক)
    // =========================================================================
    // -- ডিফাল্ট সাইন-আপ গিফট (আপনার নতুন স্কিমা অনুযায়ী)
    let startupCoinBalance = 100.00000000; 
    const REFERRER_BONUS = 500; 
    const REFERRED_BONUS = 1000; 

    if (finalReferrerId && finalReferrerName) {
      
      // ক) আপনার নতুন "referrals" টেবিলে হিস্ট্রি রেকর্ড জমা করা
      const insertHistorySQL = `
        INSERT INTO "referrals" (
          "referrer_id", "referrer_username", 
          "referred_id", "referred_username", 
          "referrer_bonus_coins", "referred_bonus_coins"
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `;
      await query(insertHistorySQL, [
        finalReferrerId, finalReferrerName, 
        uniqueUserId, sanitizedUsername, 
        REFERRER_BONUS, REFERRED_BONUS
      ]);

      // খ) রেফারার ইউজারের মেইন ওয়ালেটে (user_wallets) বোনাস টপ-আপ করা
      const updateReferrerWalletSQL = `
        UPDATE "user_wallets" 
        SET "total_coin" = "total_coin" + $1, "updated_at" = NOW()
        WHERE "user_id" = $2
      `;
      await query(updateReferrerWalletSQL, [REFERRER_BONUS, finalReferrerId]);

      // গ) রেফারে আসার কারণে নতুন ইউজারের স্টার্টিং ব্যালেন্স আপডেট
      startupCoinBalance = startupCoinBalance + REFERRED_BONUS;
    }

    // ঘ) নতুন ইউজারের জন্য "user_wallets" টেবিলে রো ক্রিয়েট করা
    const createWalletSQL = `
      INSERT INTO "user_wallets" ("user_id", "user_email", "username", "total_coin", "total_dollar")
      VALUES ($1, $2, $3, $4, 0.00)
    `;
    await query(createWalletSQL, [uniqueUserId, sanitizedEmail, sanitizedUsername, startupCoinBalance]);
    // =========================================================================

    // 🔐 ৭. অটোমেটিক সেশন তৈরি এবং ব্রাউজার কুকি সেট করা
    // এতে ইউজারকে রেজিস্ট্রেশনের পর পুনরায় কষ্ট করে লগইন করতে হবে না
    await createSession(uniqueUserId);

    return NextResponse.json({ 
      success: true, 
      message: "Account and Secure Node configuration setup complete!" 
    }, { status: 201 });

  } catch (error) {
    console.error("PostgreSQL Architecture Registration Error:", error);
    return NextResponse.json({ success: false, error: "Internal Database Server Error." }, { status: 500 });
  }
}