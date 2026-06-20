import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
// import { getServerSession } from "next-auth"; // আপনার সেশন থাকলে আনকমেন্ট করুন

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, action } = body;

    // 🔒 সেশন থেকে ইমেইল বের করার লজিক
    // const session = await getServerSession(authOptions);
    // const userEmail = session?.user?.email;
    const userEmail = "sano0099@gmail.com"; 

    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized access detected." }, { status: 401 });
    }

    const sanitizedEmail = userEmail.trim().toLowerCase();

    // 🕵️ প্রথম কাজ: ইমেইল দিয়ে ডাটাবেজ থেকে ইউজারের user_id এবং বর্তমান ওয়ালেট স্ট্যাটাস বের করা
    const walletCheckQuery = `
      SELECT w.user_id, COALESCE(w.mining_wallet, 0) as mining_wallet, COALESCE(w.total_coin, 0) as total_coin
      FROM users u
      LEFT JOIN user_wallets w ON u.id = w.user_id
      WHERE u.email = $1
      LIMIT 1;
    `;
    const walletCheckResult = await query(walletCheckQuery, [sanitizedEmail]);

    if (walletCheckResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: "User wallet infrastructure not found." }, { status: 404 });
    }

    const { user_id: userId, mining_wallet: currentMiningWallet, total_coin: currentTotalCoin } = walletCheckResult.rows[0];

    // ==========================================
    // 📥 কন্ডিশন ১: COLLECT (লাইভ কাউন্টার মাইনিং ওয়ালেটে জমা হবে)
    // ==========================================
    if (action === "COLLECT") {
      if (!amount || isNaN(amount) || amount <= 0) {
        return NextResponse.json({ success: false, error: "Invalid collection amount." }, { status: 400 });
      }

      // নতুন ব্যালেন্স হিসাব (৮ ঘর ফিক্সড)
      const newMiningWallet = parseFloat((parseFloat(currentMiningWallet) + parseFloat(amount)).toFixed(8));

      // ডাটাবেজে user_wallets টেবিলের mining_wallet কলাম আপডেট করার কুয়েরি
      const updateCollectQuery = `
        UPDATE user_wallets 
        SET mining_wallet = $1 
        WHERE user_id = $2
        RETURNING mining_wallet;
      `;
      const updateResult = await query(updateCollectQuery, [newMiningWallet, userId]);

      // 🔥 ফিক্স: এখানে newTotalCoin-এ বর্তমান ডাটাবেজের টোটাল কয়েন (currentTotalCoin) পাঠিয়ে দিতে হবে,
      // যেন রিডাক্স আপডেট হওয়ার সময় টপবারের ব্যালেন্স ০ (জিরো) না হয়ে যায়।
      return NextResponse.json({
        success: true,
        message: "Coins collected safely to PostgreSQL mining wallet",
        newMiningWallet: parseFloat(updateResult.rows[0].mining_wallet || 0),
        newTotalCoin: parseFloat(currentTotalCoin) // টপবার সিঙ্ক রাখার জন্য মাস্ট!
      }, { status: 200 });
    }

    // ==========================================
    // 🔄 কন্ডিশন ২: SYNC (মাইনিং ওয়ালেট মেইন ওয়ালেটে সিঙ্ক হয়ে ০ হবে)
    // ==========================================
    if (action === "SYNC") {
      if (parseFloat(currentMiningWallet) <= 0) {
        return NextResponse.json({ success: false, error: "No coins available in mining wallet to sync." }, { status: 400 });
      }

      // নতুন টোটাল কয়েন = মেইন কয়েন + মাইনিং ওয়ালেট কয়েন
      const newTotalCoin = parseFloat((parseFloat(currentTotalCoin) + parseFloat(currentMiningWallet)).toFixed(8));
      const targetMiningWallet = 0.00000000; // সিঙ্ক শেষে শূন্য হয়ে যাবে

      // ডাটাবেজে total_coin বাড়ানো এবং mining_wallet শূন্য (0) করার কুয়েরি
      const updateSyncQuery = `
        UPDATE user_wallets 
        SET total_coin = $1, mining_wallet = $2 
        WHERE user_id = $3
        RETURNING total_coin, mining_wallet;
      `;
      const updateResult = await query(updateSyncQuery, [newTotalCoin, targetMiningWallet, userId]);

      return NextResponse.json({
        success: true,
        message: "Successfully synced to Central Vault Architecture",
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