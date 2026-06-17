import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "megaminer_super_secret_node_key_2026";

export async function GET(request) {
  try {
    // 1. Security Handshake: Extract Token from HTTP-Only Cookies
    const tokenCookie = request.cookies.get("token");
    const token = tokenCookie?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication token missing. Please log in again." },
        { status: 401 }
      );
    }

    // 2. Decode & Verify JWT Token Payload securely
    let decodedSession;
    try {
      decodedSession = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, error: "Session expired or corrupted. Re-authenticate." },
        { status: 401 }
      );
    }

    const currentLoggedId = decodedSession.id;       // Logged in User's 5-digit unique ID
    const currentLoggedUser = decodedSession.username; // Logged in User's username

    // 3. Query A: Fetch Current Wallet Balances (total_coin, total_dollar)
    const walletQuery = "SELECT total_coin, total_dollar FROM user_wallets WHERE user_id = $1";
    const walletRes = await query(walletQuery, [currentLoggedId]);
    
    const totalCoin = parseInt(walletRes.rows[0]?.total_coin || 0);
    const totalDollar = parseFloat(walletRes.rows[0]?.total_dollar || 0.00);

    // Query B: Calculate total referrals and total earnings from history ledger
    const referralStatsQuery = `
      SELECT 
        COUNT(*) as total_count,
        COALESCE(SUM(referrer_bonus_coins), 0) as total_earnings
      FROM referral_earnings 
      WHERE referrer_id = $1
    `;
    const statsRes = await query(referralStatsQuery, [currentLoggedId]);
    const totalReferrals = parseInt(statsRes.rows[0]?.total_count || 0);
    const referralEarnings = parseInt(statsRes.rows[0]?.total_earnings || 0);

    // Query C: Fetch full relational log rows from referral_earnings table
    const historyQuery = `
      SELECT 
        referred_id, 
        referred_username, 
        referrer_bonus_coins,
        referred_bonus_coins,
        created_at
      FROM referral_earnings 
      WHERE referrer_id = $1 
      ORDER BY created_at DESC 
      LIMIT 15
    `;
    const historyRes = await query(historyQuery, [currentLoggedId]);

    // 4. Formulation of standard invitation link using the unique username
    const referralLink = `http://localhost:3000/auth/register?ref=${currentLoggedUser}`;

    // 5. Package and emit optimized JSON data stream
    return NextResponse.json({
      success: true,
      data: {
        totalCoin: totalCoin,
        totalDollar: totalDollar,
        totalReferrals: totalReferrals,
        referralEarnings: referralEarnings,
        referralLink: referralLink,
        referredFriends: historyRes.rows // Emits the exact DB rows seamlessly
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Critical Failure in Referral API Stream:", error);
    return NextResponse.json(
      { success: false, error: "Internal Gateway Server Error. Connection pool blocked." },
      { status: 500 }
    );
  }
}