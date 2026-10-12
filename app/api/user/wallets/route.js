import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getSession } from "@/app/lib/auth";

export async function GET() {
  try {
    // ১. সেশন চেক করা (লগইন ছাড়া কেউ দেখতে পাবে না)
    const userSession = await getSession();
    
    if (!userSession || !userSession.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized! Please login first." },
        { status: 401 }
      );
    }

    const userId = userSession.id; // UUID ফরম্যাট

    // ২. ডাটাবেজ থেকে শুধুমাত্র এই ইউজারের ওয়ালেট ডেটা আনা
    const walletQuery = `
      SELECT "total_coin", "available_coin", "pending_coin", "locked_coin", "total_cash", "available_cash", "pending_cash" 
      FROM "wallets" 
      WHERE "user_id" = $1;
    `;
    
    const walletRes = await query(walletQuery, [userId]);

    if (walletRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Wallet not found for this user." },
        { status: 404 }
      );
    }

    const wallet = walletRes.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        totalCoin: Number(wallet.total_coin || 0),
        availableCoin: Number(wallet.available_coin || 0),
        pendingCoin: Number(wallet.pending_coin || 0),
        lockedCoin: Number(wallet.locked_coin || 0),
        totalCash: Number(wallet.total_cash || 0),
        availableCash: Number(wallet.available_cash || 0),
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Wallet Fetch API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}