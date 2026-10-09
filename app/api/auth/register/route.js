import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import bcrypt from "bcryptjs";
import { createSession } from "@/app/lib/auth"; // 🔐 auto login session method 

// 5-digit unique user ID generator
function generateFiveDigitId() {
  return Math.floor(10000 + Math.random() * 90000); // from 10000 to 99999
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Received registration data:", body);
    const { username, email, password, referralCode } = body;

    // 1. Field validation check
    if (!username || !email || !password) {
      return NextResponse.json({ success: false, error: "Please fill in all required fields." }, { status: 400 });
    } 

    const sanitizedUsername = username.trim().toLowerCase();
    const sanitizedEmail = email.trim().toLowerCase();

    // 2. Security check: Check if username or user_email already exists in the database
    const checkUserQuery = 'SELECT "id" FROM "users" WHERE "username" = $1 OR "user_email" = $2';
    const existingUserRes = await query(checkUserQuery, [sanitizedUsername, sanitizedEmail]);
    
    if (existingUserRes.rows.length > 0) {
      return NextResponse.json({ success: false, error: "This username or email is already registered." }, { status: 400 });
    }

    // 3. Ensure unique 5-digit user_id
    let uniqueUserId = generateFiveDigitId();
    let idExists = true;
    
    while (idExists) {
      const checkIdQuery = 'SELECT "id" FROM "users" WHERE "user_id" = $1';
      const idRes = await query(checkIdQuery, [uniqueUserId]);
      if (idRes.rows.length === 0) {
        idExists = false; 
      } else {
        uniqueUserId = generateFiveDigitId(); 
      }
    }

    // 4. Referral validation
    let finalReferrerId = null;
    let finalReferrerName = null;
    
    if (referralCode && referralCode.trim() !== "") {
      const cleanRefCode = referralCode.trim().toLowerCase(); 
      
      if (cleanRefCode === sanitizedUsername) {
        return NextResponse.json({ success: false, error: "You cannot refer yourself." }, { status: 400 });
      } 

      // Fetch referrer's id and username
      const referrerCheckQuery = 'SELECT "id", "username" FROM "users" WHERE "username" = $1 OR "referral_code" = $1';
      const referrerRes = await query(referrerCheckQuery, [cleanRefCode]);

      if (referrerRes.rows.length === 0) {
        return NextResponse.json({ success: false, error: "Invalid referral code. Referrer not found." }, { status: 400 });
      }

      finalReferrerId = referrerRes.rows[0].id;
      finalReferrerName = referrerRes.rows[0].username; 
    }

    // 5. Secure password hashing (bcryptjs)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt); 

    // 6. Insert data into main `users` table using your exact column names
    const insertQuery = `
      INSERT INTO "users" ("user_id", "username", "user_email", "password_hash", "referred_by", "full_name", "referral_code") 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING "id";
    `;
    
    const newUserRes = await query(insertQuery, [
      uniqueUserId, 
      sanitizedUsername, 
      sanitizedEmail, 
      hashedPassword, 
      finalReferrerId, 
      sanitizedUsername, // full_name এর জন্য আপাতত username ব্যবহার করা হলো
      sanitizedUsername  // user এর নিজস্ব referral_code হিসেবে username সেট করা হলো
    ]);

    const newlyCreatedUserId = newUserRes.rows[0].id;

    // 7. Automatically create a record in `user_profiles` table to satisfy Foreign Key constraints
    const profileInsertQuery = `
      INSERT INTO "user_profiles" ("user_id") 
      VALUES ($1)
      ON CONFLICT ("user_id") DO NOTHING;
    `;
    await query(profileInsertQuery, [newlyCreatedUserId]);

    // 8. Automatic session creation and browser cookie setting
    await createSession(newlyCreatedUserId);

    return NextResponse.json({ 
      success: true, 
      message: "Account and Secure Node configuration setup complete!" 
    }, { status: 201 });

  } catch (error) {
    console.error("Database Registration Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Database Server Error." }, { status: 500 });
  }
}