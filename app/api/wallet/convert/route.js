import { NextResponse } from "next/server";
import { query } from "@/app/lib/db"; 

export async function POST(request) {
  try {
    const body = await request.json();
    const { coinsToMinus, dollarsToPlus } = body;

    // 🔒 ১. ব্যাকএন্ড ভ্যালিডেশন (Integer Only & Minimum 1000 Coins)
    const exactCoins = Math.floor(Number(coinsToMinus));
    if (isNaN(exactCoins) || exactCoins < 1000) {
      return NextResponse.json(
        { success: false, message: "Invalid payload. Minimum 1,000 integer coins required." },
        { status: 400 }
      );
    }

    // 🛠️ আপনার প্রজেক্টের সেশন বা অথেনটিকেশন অনুযায়ী লগইন করা ইউজারের আইডি গেট করবেন
    const currentUserId = 53275;

    // ২. 🎯 ডাটাবেজ থেকে user_id এর উপর বেস করে ইউজারের বর্তমান কয়েন ও ডলার ব্যালেন্স চেক করা
    const userWalletCheck = await query(
      "SELECT total_coin, total_dollar FROM user_wallets WHERE user_id = $1",
      [currentUserId]
    );

    if (!userWalletCheck || userWalletCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "User wallet account not found." },
        { status: 404 }
      );
    }

    // দশমিকের ঝামেলা এড়াতে পূর্ণসংখ্যা (Integer) কারেন্ট ব্যালেন্স বের করা
    const currentCoins = Math.floor(Number(userWalletCheck.rows[0].total_coin));

    // ইনপুট দেওয়া কয়েন অ্যাকাউন্টে আছে কিনা তা চেক করা
    if (exactCoins > currentCoins) {
      return NextResponse.json(
        { success: false, message: `Insufficient balance! Max convertible whole coins: ${currentCoins}` },
        { status: 400 }
      );
    }

    // ৩. 🎯 user_id এর উপর বেস করে কয়েন মাইনাস এবং ডলার প্লাস করার মেইন কুয়েরি
    const updateWalletQuery = `
      UPDATE user_wallets 
      SET total_coin = total_coin - $1, 
          total_dollar = total_dollar + $2 
      WHERE user_id = $3
      RETURNING total_coin, total_dollar
    `;
    
    const updateResult = await query(updateWalletQuery, [exactCoins, dollarsToPlus, currentUserId]);

    // লেটেস্ট আপডেेटेड ব্যালেন্স ভেরিয়েবলে নেওয়া
    const updatedCoin = Number(updateResult.rows[0].total_coin);
    const updatedDollar = Number(updateResult.rows[0].total_dollar);

    // ৪. 📤 সফল রেসপন্স পাঠানো
    return NextResponse.json({
      success: true,
      message: "Assets converted successfully inside database.",
      newTotalCoin: updatedCoin,     // রিডাক্সের json.newTotalCoin এর সাথে সিঙ্ক হবে
      newTotalDollar: updatedDollar  // রিডাক্সের json.newTotalDollar এর সাথে সিঙ্ক হবে
    });

  } catch (error) {
    console.error("Database Update Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error in core banking ledger." },
      { status: 500 }
    );
  }
}


// import { NextResponse } from "next/server";
// import { query } from "@/app/lib/db"; 

// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const { coinsToMinus, dollarsToPlus } = body;

//     // 🔒 ১. ব্যাকএন্ড ভ্যালিডেশন (Integer Only & Minimum 1000 Coins)
//     const exactCoins = Math.floor(Number(coinsToMinus));
//     if (isNaN(exactCoins) || exactCoins < 1000) {
//       return NextResponse.json(
//         { success: false, message: "Invalid payload. Minimum 1,000 integer coins required." },
//         { status: 400 }
//       );
//     }

//     // 🛠️ আপনার প্রজেক্টের সেশন বা অথেনটিকেশন অনুযায়ী ইউজার আইডি গেট করবেন
//     const userId = 53275;

//     // ২. ডাটাবেজ থেকে ইউজারের বর্তমান কয়েন ও ডলার ব্যালেন্স চেক করা
//     // 💡 ফিক্সড: আপনার নতুন কলাম ও টেবিলের নাম (user_wallets, total_coin, total_dollar) অনুযায়ী সিঙ্ক করা হয়েছে
//     const userWalletCheck = await query(
//       "SELECT total_coin, total_dollar FROM user_wallets WHERE id = $1",
//       [userId]
//     );

//     if (!userWalletCheck || userWalletCheck.rows.length === 0) {
//       return NextResponse.json(
//         { success: false, message: "User wallet account not found." },
//         { status: 404 }
//       );
//     }

//     // দশমিকের ঝামেলা এড়াতে পূর্ণসংখ্যা (Integer) কারেন্ট ব্যালেন্স বের করা
//     // 💡 ফিক্সড: কলামের নাম .total_coin করা হয়েছে
//     const currentCoins = Math.floor(Number(userWalletCheck.rows[0].total_coin));

//     // ইনপুট দেওয়া কয়েন অ্যাকাউন্টে আছে কিনা তা চেক করা
//     if (exactCoins > currentCoins) {
//       return NextResponse.json(
//         { success: false, message: `Insufficient balance! Max convertible whole coins: ${currentCoins}` },
//         { status: 400 }
//       );
//     }

//     // ৩. 🎯 user_wallets টেবিলে কয়েন মাইনাস এবং ডলার প্লাস করার মেইন কুয়েরি
//     const updateWalletQuery = `
//       UPDATE user_wallets 
//       SET total_coin = total_coin - $1, 
//           total_dollar = total_dollar + $2 
//       WHERE id = $3
//       RETURNING total_coin, total_dollar
//     `;
    
//     const updateResult = await query(updateWalletQuery, [exactCoins, dollarsToPlus, userId]);

//     // เลটেস্ট আপডেটেড ব্যালেন্স ভেরিয়েবলে নেওয়া
//     // 💡 ফিক্সড: ডাটাবেজ রিটার্ন অবজেক্টের কীগুলো আন্ডারস্কোরসহ (total_coin, total_dollar) রিড করা হয়েছে
//     const updatedCoin = Number(updateResult.rows[0].total_coin);
//     const updatedDollar = Number(updateResult.rows[0].total_dollar);

//     // ৪. 📤 সফল রেসপন্স পাঠানো
//     return NextResponse.json({
//       success: true,
//       message: "Assets converted successfully inside database.",
//       newTotalCoin: updatedCoin,     // রিডাক্সের json.newTotalCoin এর সাথে সিঙ্ক হবে
//       newTotalDollar: updatedDollar  // রিডাক্সের json.newTotalDollar এর সাথে সিঙ্ক হবে
//     });

//   } catch (error) {
//     console.error("Database Update Error:", error);
//     return NextResponse.json(
//       { success: false, message: "Internal Server Error in core banking ledger." },
//       { status: 500 }
//     );
//   }
// }