import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getSession } from "@/app/lib/auth"; // 🔐 আমাদের আপডেট করা সিকিউর সেশন ইঞ্জিন

export async function POST(request) {
  try {
    const body = await request.json();
    const { coinsToMinus } = body; // 💸 ফ্রন্টএন্ড থেকে শুধু কয়েন রিড করা হচ্ছে সেফটির জন্য

    // 🔒 ১. সেশন ভ্যালিডেশন এবং লাইভ ইউজার আইডি এক্সট্রাকশন
    const session = await getSession();
    
    if (!session || !session.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access. Active node session required." },
        { status: 401 }
      );
    }

    const currentUserId = session.id; // 🤝 সেশন থেকে পাওয়া ক্লিন ইন্টিজার user_id

    // 🔒 ২. ব্যাকএন্ড ভ্যালিডেশন (Integer Only & Minimum 1000 Coins)
    const exactCoins = Math.floor(Number(coinsToMinus));
    if (isNaN(exactCoins) || exactCoins < 1000) {
      return NextResponse.json(
        { success: false, message: "Invalid payload. Minimum 1,000 integer coins required." },
        { status: 400 }
      );
    }

    // 🧮 ৩. এক্সচেঞ্জ রেট ইঞ্জিন (১০০০ কয়েন = ১.০০ ডলার)
    // ফ্রন্টএন্ড থেকে আসা ডলারের ভ্যালু ইগনোর করে ব্যাকএন্ডে নিজে হিসাব করবে যাতে হ্যাকিং বা ব্রিচ না হয়
    const CONVERSION_RATE = 1000; 
    const dollarsToPlus = parseFloat((exactCoins / CONVERSION_RATE).toFixed(2));

    // ৪. 🎯 ডাটাবেজ থেকে নতুন স্কিমা অনুযায়ী ইউজারের বর্তমান ওয়ালেট ব্যালেন্স চেক করা
    const userWalletCheck = await query(
      'SELECT "total_coin", "total_dollar" FROM "user_wallets" WHERE "user_id" = $1',
      [currentUserId]
    );

    if (!userWalletCheck || userWalletCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "User wallet account not found." },
        { status: 404 }
      );
    }

    // দশমিকের ঝামেলা এড়াতে পূর্ণসংখ্যা (Integer) কারেন্ট ব্যালেন্স বের করা
    const currentCoins = Math.floor(Number(userWalletCheck.rows[0].total_coin));

    // ইনপুট দেওয়া কয়েন অ্যাকাউন্টে আছে কিনা তা চেক করা
    if (exactCoins > currentCoins) {
      return NextResponse.json(
        { success: false, message: `Insufficient balance! Max convertible whole coins: ${currentCoins}` },
        { status: 400 }
      );
    }

    // ৫. 🎯 নতুন ডাটাবেজ আর্কিটেকচার অনুযায়ী কয়েন মাইনাস এবং ডলার প্লাস করার কুয়েরি
    const updateWalletQuery = `
      UPDATE "user_wallets" 
      SET "total_coin" = "total_coin" - $1, 
          "total_dollar" = "total_dollar" + $2,
          "updated_at" = NOW()
      WHERE "user_id" = $3
      RETURNING "total_coin", "total_dollar"
    `;
    
    const updateResult = await query(updateWalletQuery, [exactCoins, dollarsToPlus, currentUserId]);

    // লেটেস্ট আপডেটেড ব্যালেন্স ভেরিয়েবলে নেওয়া
    const updatedCoin = parseFloat(updateResult.rows[0].total_coin || 0);
    const updatedDollar = parseFloat(updateResult.rows[0].total_dollar || 0);

    // ৬. 📤 সফল রেসপন্স পাঠানো (রিডাক্স অ্যাকশন সিঙ্কের কি-নাম অনুযায়ী)
    return NextResponse.json({
      success: true,
      message: `Successfully converted ${exactCoins.toLocaleString()} coins into $${dollarsToPlus} USD!`,
      newTotalCoin: updatedCoin,     // রিডাক্সের জেসন সিঙ্কের সাথে ১০০% ডাইনামিক
      newTotalDollar: updatedDollar  // রিডাক্সের জেসন সিঙ্কের সাথে ১০০% ডাইনামিক
    }, { status: 200 });

  } catch (error) {
    console.error("Database Core Banking Ledger Update Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error in core banking ledger transaction." },
      { status: 500 }
    );
  }
}