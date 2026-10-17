import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import bcrypt from "bcryptjs";
import { createSession } from "@/app/lib/auth"; // 🔐 auto login session method
import { addXpToUser } from "@/app/lib/level"; // ⚡ Level & XP helper

// 🪙 Koyen bonus configuration
const NEW_USER_WELCOME_BONUS = 1000; // Notun user pabe 1000 koyen
const REFERRER_BONUS_COIN = 500; // Referrer pabe 500 koyen

// ⚡ XP Bonus Configuration
const NEW_USER_WELCOME_XP = 100; // Notun user sign up korle pabe 100 XP
const REFERRER_BONUS_XP = 200;   // Keuake refer korle referrer pabe 200 XP

// 5-digit unique user ID generator
function generateFiveDigitId() {
  return Math.floor(10000 + Math.random() * 90000); // 10000 to 99999
}

export async function POST(request) {
  try {
    const body = await request.json();

    const username = body.username;
    const email = body.email;
    const password = body.password;
    const rawReferralCode = body.referralCode || body.referral_code || "";

    // 1. Field validation check
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Please fill in all required fields." },
        { status: 400 },
      );
    }

    const sanitizedUsername = username.trim().toLowerCase();
    const sanitizedEmail = email.trim().toLowerCase();

    // 2. Check if username or user_email already exists
    const checkUserQuery = `
      SELECT "id" FROM "users" 
      WHERE LOWER("username") = $1 OR LOWER("user_email") = $2;
    `;
    const existingUserRes = await query(checkUserQuery, [
      sanitizedUsername,
      sanitizedEmail,
    ]);

    if (existingUserRes.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "This username or email is already registered.",
        },
        { status: 400 },
      );
    }

    // 3. Ensure unique 5-digit user_id
    let uniqueUserId = generateFiveDigitId();
    let idExists = true;

    while (idExists) {
      const checkIdQuery = 'SELECT "id" FROM "users" WHERE "user_id" = $1;';
      const idRes = await query(checkIdQuery, [uniqueUserId]);
      if (idRes.rows.length === 0) {
        idExists = false;
      } else {
        uniqueUserId = generateFiveDigitId();
      }
    }

    // 🎯 4. REFERRAL CODE CHECK & OWNER UUID FINDING
    let finalReferrerOwnerId = null;

    if (rawReferralCode && rawReferralCode.trim() !== "") {
      const cleanRefCode = rawReferralCode.trim().toLowerCase();

      if (cleanRefCode === sanitizedUsername) {
        return NextResponse.json(
          { success: false, error: "You cannot refer yourself." },
          { status: 400 },
        );
      }

      // Referral code ba username diye referrer er UUID (id) khoja hocche
      const referrerCheckQuery = `
        SELECT "id" FROM "users" 
        WHERE LOWER("referral_code") = $1 OR LOWER("username") = $1;
      `;
      const referrerRes = await query(referrerCheckQuery, [cleanRefCode]);

      if (referrerRes.rows.length > 0) {
        finalReferrerOwnerId = referrerRes.rows[0].id; // Referrer UUID
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid referral code. Referrer not found.",
          },
          { status: 400 },
        );
      }
    }

    // 5. Password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // -----------------------------------------------------------------
    // 🚀 STEP 1: New User Entry in `users` Table (Starts with initial XP if needed)
    // -----------------------------------------------------------------
    const insertUserQuery = `
      INSERT INTO "users" ("user_id", "username", "user_email", "password_hash", "referred_by", "full_name", "referral_code", "current_xp", "current_level") 
      VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 1)
      RETURNING "id";
    `;

    const newUserRes = await query(insertUserQuery, [
      uniqueUserId,
      sanitizedUsername,
      sanitizedEmail,
      hashedPassword,
      finalReferrerOwnerId,
      sanitizedUsername,
      sanitizedUsername,
    ]);

    const newlyCreatedUserId = newUserRes.rows[0].id; // New User UUID

    // -----------------------------------------------------------------
    // 🚀 STEP 1.1: Give Initial Welcome XP to New User (+100 XP)
    // -----------------------------------------------------------------
    await addXpToUser(newlyCreatedUserId, NEW_USER_WELCOME_XP);

    // -----------------------------------------------------------------
    // 🚀 STEP 1.2: Create Referral Record for new user
    // -----------------------------------------------------------------
    if (finalReferrerOwnerId) {
      const insertReferralRecord = `
        INSERT INTO "referrals" ("referrer_id", "referred_id", "reward_amount", "status") 
        VALUES ($1, $2, $3, 'completed');
      `;
      await query(insertReferralRecord, [
        finalReferrerOwnerId,
        newlyCreatedUserId,
        REFERRER_BONUS_COIN,
      ]);
    }

    // -----------------------------------------------------------------
    // 🚀 STEP 2: Create Wallet for New User (1000 Coins)
    // -----------------------------------------------------------------
    const walletInsertQuery = `
      INSERT INTO "wallets" (
        "user_id", 
        "total_coin", 
        "available_coin", 
        "pending_coin", 
        "locked_coin", 
        "total_cash", 
        "available_cash", 
        "pending_cash"
      ) VALUES ($1, $2, $2, 0, 0, 0.00, 0.00, 0.00);
    `;
    await query(walletInsertQuery, [
      newlyCreatedUserId,
      NEW_USER_WELCOME_BONUS,
    ]);

    // -----------------------------------------------------------------
    // 🚀 STEP 3: Update Referrer's Wallet (+500 Coins) & Add XP (+200 XP)
    // -----------------------------------------------------------------
    if (finalReferrerOwnerId) {
      const updateReferrerWalletQuery = `
        UPDATE "wallets" 
        SET "total_coin" = "total_coin" + $1, 
            "available_coin" = "available_coin" + $1,
            "updated_at" = CURRENT_TIMESTAMP
        WHERE "user_id" = $2;
      `;
      const updateResult = await query(updateReferrerWalletQuery, [
        REFERRER_BONUS_COIN,
        finalReferrerOwnerId,
      ]);

      if (updateResult.rowCount === 0) {
        const createOwnerWallet = `
          INSERT INTO "wallets" (
            "user_id", "total_coin", "available_coin", "pending_coin", "locked_coin", "total_cash", "available_cash", "pending_cash"
          ) VALUES ($1, $2, $2, 0, 0, 0.00, 0.00, 0.00);
        `;
        await query(createOwnerWallet, [
          finalReferrerOwnerId,
          REFERRER_BONUS_COIN,
        ]);
      }

      // ⚡ Referrer ke referral baobad XP dewa hoise (+200 XP) ebong level up check kora hoise
      await addXpToUser(finalReferrerOwnerId, REFERRER_BONUS_XP);
    }

    // -----------------------------------------------------------------
    // 🚀 STEP 4: Create Profile Record
    // -----------------------------------------------------------------
    const profileInsertQuery = `
      INSERT INTO "user_profiles" ("user_id") 
      VALUES ($1)
      ON CONFLICT ("user_id") DO NOTHING;
    `;
    await query(profileInsertQuery, [newlyCreatedUserId]);

    // -----------------------------------------------------------------
    // 🚀 STEP 5: Create Auto-Login Session
    // -----------------------------------------------------------------
    await createSession(newlyCreatedUserId);

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully with referral bonus and XP setup!",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Database Registration Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal Database Server Error.",
      },
      { status: 500 },
    );
  }
}