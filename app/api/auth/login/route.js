import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Secure Secret Key for JWT (In production, always save this inside .env.local)
const JWT_SECRET = process.env.JWT_SECRET || "megaminer_super_secret_node_key_2026";

export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier, password } = body; // identifier can be username OR email

    // 1. Safe Guard: Input Validation
    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter your username/email and password." },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // 2. Query Database: Lookup user by username OR email
    const userQuery = "SELECT id, username, email, password_hash, status FROM users WHERE username = $1 OR email = $2";
    const userRes = await query(userQuery, [cleanIdentifier, cleanIdentifier]);

    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials. User not found." },
        { status: 401 }
      );
    }

    const user = userRes.rows[0];

    // 3. Security Status Check (Check if account is suspended)
    if (user.status === "suspended") {
      return NextResponse.json(
        { success: false, error: "Your account has been suspended. Contact support." },
        { status: 403 }
      );
    }

    // 4. Verify Cryptographic Password Hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials. Wrong password." },
        { status: 401 }
      );
    }

    // 5. Generate Secure JWT Session Token
    const sessionPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    const token = jwt.sign(sessionPayload, JWT_SECRET, { expiresIn: "7d" }); // Token valid for 7 days

    // 6. Set httpOnly Cookie for Military-Grade Client Security
    const response = NextResponse.json(
      { 
        success: true, 
        message: "Login authorized successfully! Redirecting to ecosystem...",
        user: { id: user.id, username: user.username, email: user.email }
      },
      { status: 200 }
    );

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true, // Prevents XSS script attacks
      secure: process.env.NODE_ENV === "production", // Enforces HTTPS in production
      sameSite: "strict", // Protects against CSRF attacks
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("PostgreSQL Security Engine Login Failure:", error);
    return NextResponse.json(
      { success: false, error: "Internal Authentication Stream Error." },
      { status: 500 }
    );
  }
}