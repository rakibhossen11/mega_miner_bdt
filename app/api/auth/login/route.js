import { NextResponse } from "next/server";
import { query } from "@/app/lib/db"; 
import bcrypt from "bcryptjs";
import { createSession } from "@/app/lib/auth"; // 🔐 সেশন জেনারেটর মেথড

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body; 
    // console.log({ email, password });

    // ১. ইনপুট ভ্যালিডেশন
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter your email or username and password." },
        { status: 400 }
      );
    }

    const cleanIdentifier = email.trim().toLowerCase();

    // ২. ডাটাবেজ কুয়েরি: নতুন স্কিমা ও কলামের নাম (user_id, user_email, password_hash) অনুযায়ী ফিক্সড
    const userQuery = `
      SELECT "user_id", "username", "user_email", "password_hash", "status" 
      FROM "users" 
      WHERE "username" = $1 OR "user_email" = $2
    `;
    const userRes = await query(userQuery, [cleanIdentifier, cleanIdentifier]);

    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials. User not found." },
        { status: 401 }
      );
    }

    const user = userRes.rows[0];

    // ৩. অ্যাকাউন্ট স্ট্যাটাস চেক
    if (user.status === "suspended") {
      return NextResponse.json(
        { success: false, error: "Your account has been suspended. Contact support." },
        { status: 403 }
      );
    }

    // ৪. পাসওয়ার্ড ভেরিফিকেশন (Bcrypt কম্পেয়ার)
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials. Wrong password." },
        { status: 401 }
      );
    }

    // ৫. নতুন ডাটাবেজ আর্কিটেকচার অনুযায়ী সেশন তৈরি এবং কুকি সেট করা
    // এখানে user.user_id সেশন টেবিলের "user_id" কলামে গিয়ে রিলেশন লক করবে
    await createSession(user.user_id);

    // ৬. সাকসেস রেসপন্স পাঠানো (রিডাক্স ও ফ্রন্টএন্ড স্টেটের সাথে সামঞ্জস্য রেখে)
    return NextResponse.json(
      { 
        success: true, 
        message: "Login successful! Redirecting...",
        user: { 
          userId: user.user_id, 
          username: user.username, 
          userEmail: user.user_email 
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Authentication Global API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error during login process." },
      { status: 500 }
    );
  }
}