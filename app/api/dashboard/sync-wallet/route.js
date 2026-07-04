import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getSession } from "@/app/lib/auth"; // 🔐 আমাদের আপডেট করা সিকিউর সেশন মেকানিজম

export async function POST(request) {
  try {
    // 🔒 ১. সেশন ভ্যালিডেশন এবং লাইভ user_id এক্সট্রাকশন
    const session = await getSession();
    
    if (!session || !session.id) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized access detected. Active node session required." 
      }, { status: 401 });
    }

    const currentUserId = session.id; // 🤝 সেশন থেকে পাওয়া ক্লিন ইন্টিজার user_id
    const body = await request.json();
    const { amount, action } = body;

    // 🕵️ ২. নতুন স্কিমা অনুযায়ী সরাসরি user_id দিয়ে ওয়ালেট স্ট্যাটাস চেক (ফাস্ট পারফরম্যান্স)
    const walletCheckQuery = `
      SELECT "user_id", COALESCE("mining_wallet", 0) AS "mining_wallet", COALESCE("total_coin", 0) AS "total_coin"
      FROM "user_wallets" 
      WHERE "user_id" = $1
      LIMIT 1;
    `;
    const walletCheckResult = await query(walletCheckQuery, [currentUserId]);

    if (walletCheckResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: "User wallet infrastructure not found." }, { status: 404 });
    }

    const { 
      mining_wallet: currentMiningWallet, 
      total_coin: currentTotalCoin 
    } = walletCheckResult.rows[0];

    // =========================================================================
    // 📥 কন্ডিশন ১: COLLECT (লাইভ কাউন্টার মাইনিং ওয়ালেটে জমা হবে)
    // =========================================================================
    if (action === "COLLECT") {
      if (!amount || isNaN(amount) || amount <= 0) {
        return NextResponse.json({ success: false, error: "Invalid collection amount." }, { status: 400 });
      }

      // নতুন ব্যালেন্স হিসাব (৮ ঘর ফিক্সড)
      const newMiningWallet = parseFloat((parseFloat(currentMiningWallet) + parseFloat(amount)).toFixed(8));

      // নতুন স্কিমা অনুযায়ী কোটেশন ফিক্সড আপডেট কুয়েরি
      const updateCollectQuery = `
        UPDATE "user_wallets" 
        SET "mining_wallet" = $1, "updated_at" = NOW()
        WHERE "user_id" = $2
        RETURNING "mining_wallet";
      `;
      const updateResult = await query(updateCollectQuery, [newMiningWallet, currentUserId]);

      return NextResponse.json({
        success: true,
        message: "Coins collected safely to PostgreSQL mining wallet",
        newMiningWallet: parseFloat(updateResult.rows[0].mining_wallet || 0),
        newTotalCoin: parseFloat(currentTotalCoin) // 🔥 রিডাক্স টপবার ব্যালেন্স সেফটি সিঙ্ক
      }, { status: 200 });
    }

    // =========================================================================
    // 🔄 কন্ডিশন ২: SYNC (মাইনিং ওয়ালেট মেইন ব্যালেন্সে সিঙ্ক হয়ে ০ হবে)
    // =========================================================================
    if (action === "SYNC") {
      if (parseFloat(currentMiningWallet) <= 0) {
        return NextResponse.json({ success: false, error: "No coins available in mining wallet to sync." }, { status: 400 });
      }

      // নতুন টোটাল কয়েন = মেইন কয়েন + মাইনিং ওয়ালেট কয়েন
      const newTotalCoin = parseFloat((parseFloat(currentTotalCoin) + parseFloat(currentMiningWallet)).toFixed(8));
      const targetMiningWallet = 0.00000000; // সিঙ্ক শেষে ওয়ালেট কাউন্টার রিসেট

      const updateSyncQuery = `
        UPDATE "user_wallets" 
        SET "total_coin" = $1, "mining_wallet" = $2, "updated_at" = NOW()
        WHERE "user_id" = $3
        RETURNING "total_coin", "mining_wallet";
      `;
      const updateResult = await query(updateSyncQuery, [newTotalCoin, targetMiningWallet, currentUserId]);

      return NextResponse.json({
        success: true,
        message: "Successfully synced to Central Vault Architecture",
        newMiningWallet: parseFloat(updateResult.rows[0].mining_wallet || 0),
        newTotalCoin: parseFloat(updateResult.rows[0].total_coin || 0)
      }, { status: 200 });
    }

    // =========================================================================
    // 📊 কন্ডিশন ৩: CLAIM_HISTORY (রিডাক্সের হিস্ট্রি আইটেম ক্লেইম মেকানিজম)
    // =========================================================================
    if (action === "CLAIM_HISTORY") {
      if (!amount || isNaN(amount) || amount <= 0) {
        return NextResponse.json({ success: false, error: "Invalid claim history amount." }, { status: 400 });
      }

      const newTotalCoin = parseFloat((parseFloat(currentTotalCoin) + parseFloat(amount)).toFixed(8));

      const updateHistoryQuery = `
        UPDATE "user_wallets" 
        SET "total_coin" = $1, "updated_at" = NOW()
        WHERE "user_id" = $2
        RETURNING "total_coin", "mining_wallet";
      `;
      const updateResult = await query(updateHistoryQuery, [newTotalCoin, currentUserId]);

      return NextResponse.json({
        success: true,
        message: "History milestone reward claimed successfully",
        newMiningWallet: parseFloat(updateResult.rows[0].mining_wallet || 0),
        newTotalCoin: parseFloat(updateResult.rows[0].total_coin || 0)
      }, { status: 200 });
    }

    return NextResponse.json({ success: false, error: "Invalid pipeline action execution." }, { status: 400 });

  } catch (error) {
    console.error("Postgres Wallet Operations Sync Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal Postgres Transaction Engine Error" 
    }, { status: 500 });
  }
}