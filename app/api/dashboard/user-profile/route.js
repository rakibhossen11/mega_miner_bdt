import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getSession } from "@/app/lib/auth"; // 🚀 লাইভ সেশন ইঞ্জিন

// ==========================================
// 📤 GET: সেশন থেকে সরাসরি কারেন্ট ইউজারের লাইভ প্রোফাইল ডাটা রিড করা
// ==========================================
export async function GET(request) {
  try {
    const userSessionData = await getSession();

    if (!userSessionData) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized access. Session expired or not found." 
      }, { status: 401 });
    }

    // 🎯 ডেটাবেজের ডাবল কোটেশন বা স্পেস ক্লিন করার সেফটি লেয়ার
    const cleanString = (val) => val ? String(val).replace(/"/g, '').trim() : '';

    return NextResponse.json({
      success: true,
      data: {
        id: userSessionData.sessionId, // সেশন টোকেন আইডি
        userId: userSessionData.id, // মূল ইউজারের UUID (যা user_wallets এর user_id এর সাথে ম্যাচ করে)
        userEmail: cleanString(userSessionData.email),
        username: cleanString(userSessionData.username) || cleanString(userSessionData.email).split('@')[0],
        totalCoin: parseFloat(userSessionData.totalCoin || 0),
        totalDollar: parseFloat(userSessionData.totalDollar || 0),
        miningWallet: parseFloat(userSessionData.miningWallet || 0),
        miningSpeed: parseFloat(userSessionData.miningSpeed || 0),
        boostPower: parseFloat(userSessionData.boostPower || 1.00),
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Session Sync API Route Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal Server Error during dashboard profile syncing." 
    }, { status: 500 });
  }
}

// ==========================================
// 📥 POST: সেশন অনুযায়ী ওয়ালেট অ্যাকশন প্রসেস (COLLECT, SYNC, CLAIM_HISTORY)
// ==========================================
export async function POST(request) {
  try {
    // 🔒 সেশন ভ্যালিডেশন
    const session = await getSession();
    
    if (!session || !session.id) {
      return NextResponse.json({ success: false, error: "Unauthorized session." }, { status: 401 });
    }

    const currentUserId = session.id; // সেশন থেকে প্রাপ্ত ইউজারের UUID
    const body = await request.json();
    const { action, amount } = body;

    // 🚀 সঠিক UUID দিয়ে user_wallets থেকে ডাটা ফেচ করা
    const currentData = await query(
      `SELECT "total_coin", "mining_wallet" FROM "user_wallets" WHERE "user_id" = $1`,
      [currentUserId]
    );

    if (currentData.rows.length === 0) {
      return NextResponse.json({ success: false, error: "Mining wallet configuration not found." }, { status: 404 });
    }

    const currentTotalCoin = parseFloat(currentData.rows[0].total_coin || 0);
    const currentMiningWallet = parseFloat(currentData.rows[0].mining_wallet || 0);

    switch (action) {
      case "COLLECT": {
        if (!amount || amount <= 0) {
          return NextResponse.json({ success: false, error: "Invalid collection amount." }, { status: 400 });
        }

        const newTotalCoin = currentTotalCoin + amount;
        const newMiningWallet = currentMiningWallet + amount;

        await query(
          `UPDATE "user_wallets" 
            SET "total_coin" = $1, "mining_wallet" = $2, "updated_at" = NOW() 
            WHERE "user_id" = $3`,
          [newTotalCoin, newMiningWallet, currentUserId]
        );

        return NextResponse.json({
          success: true,
          newTotalCoin: newTotalCoin,
          newMiningWallet: newMiningWallet,
          message: "Rewards collected successfully"
        }, { status: 200 });
      }

      case "SYNC": {
        const newTotalCoin = currentTotalCoin + currentMiningWallet;
        const newMiningWallet = 0; 

        await query(
          `UPDATE "user_wallets" 
            SET "total_coin" = $1, "mining_wallet" = $2, "updated_at" = NOW() 
            WHERE "user_id" = $3`,
          [newTotalCoin, newMiningWallet, currentUserId]
        );

        return NextResponse.json({
          success: true,
          newTotalCoin: newTotalCoin,
          newMiningWallet: newMiningWallet,
          message: "All mined coins successfully secured to vault!"
        }, { status: 200 });
      }

      case "CLAIM_HISTORY": {
        if (!amount || amount <= 0) {
          return NextResponse.json({ success: false, error: "Invalid claim history amount." }, { status: 400 });
        }

        const newTotalCoin = currentTotalCoin + amount;
        const newMiningWallet = currentMiningWallet + amount; 

        await query(
          `UPDATE "user_wallets" 
            SET "total_coin" = $1, "mining_wallet" = $2, "updated_at" = NOW() 
            WHERE "user_id" = $3`,
          [newTotalCoin, newMiningWallet, currentUserId]
        );

        return NextResponse.json({
          success: true,
          newTotalCoin: newTotalCoin,
          newMiningWallet: newMiningWallet,
          message: "History item milestone claimed!"
        }, { status: 200 });
      }

      default: {
        return NextResponse.json({ 
          success: false, 
          error: "Invalid action type. Supported actions: COLLECT, SYNC, CLAIM_HISTORY" 
        }, { status: 400 });
      }
    }

  } catch (error) {
    console.error("Sync Wallet API Global Level Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal Server Error during secure wallet operation." 
    }, { status: 500 });
  }
}