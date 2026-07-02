import { NextResponse } from "next/server";
import { cookies } from "next/headers"; 
import { query } from "@/app/lib/db";

// 🔑 ব্রাউজার কুকি থেকে লগইন থাকা ইউজারের ইমেইল বের করার হেল্পার ফাংশন
async function getAuthenticatedUserEmail() {
  try {
    const cookieStore = await cookies(); 
    const token = cookieStore.get("auth_token")?.value; 

    if (!token) return null;

    // কুকিতে থাকা ইমেইলটি ক্লিন করে রিটার্ন করবে
    return token.trim().toLowerCase();
  } catch (err) {
    console.error("Cookie reading error in API:", err);
    return null;
  }
}

// ==========================================
// 📤 GET: সেশন অনুযায়ী লগইন থাকা ইউজারের ডাটা লোড করা
// ==========================================
export async function GET(request) {
  try {
    // 🔒 ব্রাউজার সেশন থেকে ডাইনামিক ইমেইল ডিটেক্ট করা
    const userEmail = await getAuthenticatedUserEmail(); 

    if (!userEmail) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized access. Please log in first." 
      }, { status: 401 });
    }

    const sanitizedEmail = userEmail.trim().toLowerCase();

    // 🔍 REPLACE(..., '"', '') ব্যবহার করা হয়েছে যেন ডাটাবেজের ডাবল কোটেশন থাকলেও ম্যাচ করে
    const profileQuery = `
      SELECT 
        id,
        user_id,
        user_email,
        username,
        COALESCE(total_coin, 0) as total_coin,
        COALESCE(total_dollar, 0) as total_dollar,
        mining_speed,
        daily_bonus,
        hybrid_speed,
        boost_power,
        last_claim_daily_bonus_time,
        last_claim_reward_time,
        COALESCE(mining_wallet, 0) as mining_wallet,
        created_at,
        updated_at
      FROM user_wallets
      WHERE REPLACE(LOWER(user_email), '"', '') = $1
      LIMIT 1;
    `;
    
    const result = await query(profileQuery, [sanitizedEmail]);

    if (result.rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "User profile record not found." 
      }, { status: 404 });
    }

    const userData = result.rows[0];

    // ফ্রন্টএন্ড রিডাক্স বা স্টেট অনুযায়ী রেসপন্স ডাটা ফরম্যাটিং
    return NextResponse.json({
      success: true,
      data: {
        id: userData.id,
        userId: userData.user_id,
        userEmail: userData.user_email ? userData.user_email.replace(/"/g, '') : '', // রেসপন্স থেকেও কোটেশন ক্লিয়ার করা হলো
        name: userData.username && userData.username.trim() !== "" ? userData.username.replace(/"/g, '') : userData.user_email.replace(/"/g, '').split('@')[0],
        username: userData.username ? userData.username.replace(/"/g, '') : null,
        totalCoin: parseFloat(userData.total_coin || 0),
        totalDollar: parseFloat(userData.total_dollar || 0),
        miningSpeed: parseFloat(userData.mining_speed || 0),
        dailyBonus: parseFloat(userData.daily_bonus || 0),
        hybridSpeed: parseFloat(userData.hybrid_speed || 0),
        boostPower: parseFloat(userData.boost_power || 0),
        lastClaimDailyBonusTime: userData.last_claim_daily_bonus_time,
        lastClaimRewardTime: userData.last_claim_reward_time,
        miningWallet: parseFloat(userData.mining_wallet || 0),
        createdAt: userData.created_at,
        updatedAt: userData.updated_at
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Profile Sync Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error during profile data parsing." 
    }, { status: 500 });
  }
}

// ==========================================
// 📥 POST: সেশন অনুযায়ী ওয়ালেট অ্যাকশন প্রসেস (COLLECT, SYNC, CLAIM_HISTORY)
// ==========================================
export async function POST(request) {
  try {
    // 🔒 লাইভ লগইনড ইউজারের ইমেইল নেওয়া হচ্ছে
    const userEmail = await getAuthenticatedUserEmail();
    
    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized session." }, { status: 401 });
    }

    const sanitizedEmail = userEmail.trim().toLowerCase();
    const body = await request.json();
    const { action, amount } = body;

    // 💰 ইউজারের বর্তমান ডাটা ডাটাবেজ থেকে চেক (REPLACE ট্রিকসহ)
    const currentData = await query(
      `SELECT total_coin, mining_wallet FROM user_wallets WHERE REPLACE(LOWER(user_email), '"', '') = $1`,
      [sanitizedEmail]
    );

    if (currentData.rows.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const currentTotalCoin = parseFloat(currentData.rows[0].total_coin || 0);
    const currentMiningWallet = parseFloat(currentData.rows[0].mining_wallet || 0);

    // 🎯 রিডাক্সের অ্যাকশন টাইপ অনুযায়ী কন্ডিশন রান
    switch (action) {
      
      // 📥 অ্যাকশন ১: মাইনিং কয়েন ক্লেইম করা (কাউন্টার থেকে)
      case "COLLECT": {
        if (!amount || amount <= 0) {
          return NextResponse.json({ success: false, error: "Invalid amount" }, { status: 400 });
        }

        const newTotalCoin = currentTotalCoin + amount;
        const newMiningWallet = currentMiningWallet + amount;

        await query(
          `UPDATE user_wallets 
            SET total_coin = $1, mining_wallet = $2, updated_at = NOW() 
            WHERE REPLACE(LOWER(user_email), '"', '') = $3`,
          [newTotalCoin, newMiningWallet, sanitizedEmail]
        );

        return NextResponse.json({
          success: true,
          newTotalCoin: newTotalCoin,
          newMiningWallet: newMiningWallet,
          message: "Rewards collected successfully"
        }, { status: 200 });
      }

      // 🔄 অ্যাকশন ২: সিঙ্ক টু ভল্ট (Mining Wallet থেকে Total Coin)
      case "SYNC": {
        const newTotalCoin = currentTotalCoin + currentMiningWallet;
        const newMiningWallet = 0; // মাইনিং ওয়ালেট রিসেট

        await query(
          `UPDATE user_wallets 
            SET total_coin = $1, mining_wallet = $2, updated_at = NOW() 
            WHERE REPLACE(LOWER(user_email), '"', '') = $3`,
          [newTotalCoin, newMiningWallet, sanitizedEmail]
        );

        return NextResponse.json({
          success: true,
          newTotalCoin: newTotalCoin,
          newMiningWallet: newMiningWallet,
          message: "Synced to vault successfully"
        }, { status: 200 });
      }

      // 📋 অ্যাকশন ৩: হিস্ট্রি আইটেম ক্লেইম করা
      case "CLAIM_HISTORY": {
        if (!amount || amount <= 0) {
          return NextResponse.json({ success: false, error: "Invalid amount" }, { status: 400 });
        }

        const newTotalCoin = currentTotalCoin + amount;
        const newMiningWallet = currentMiningWallet + amount; 

        await query(
          `UPDATE user_wallets 
            SET total_coin = $1, mining_wallet = $2, updated_at = NOW() 
            WHERE REPLACE(LOWER(user_email), '"', '') = $3`,
          [newTotalCoin, newMiningWallet, sanitizedEmail]
        );

        return NextResponse.json({
          success: true,
          newTotalCoin: newTotalCoin,
          newMiningWallet: newMiningWallet,
          message: "History item claimed successfully"
        }, { status: 200 });
      }

      default: {
        return NextResponse.json({ 
          success: false, 
          error: "Invalid action. Supported: COLLECT, SYNC, CLAIM_HISTORY" 
        }, { status: 400 });
      }
    }

  } catch (error) {
    console.error("Sync Wallet API Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}

// import { NextResponse } from "next/server";
// import { query } from "@/app/lib/db";

// export async function GET(request) {
//   try {
//     const userEmail = "sano0099@gmail.com"; 

//     if (!userEmail) {
//       return NextResponse.json({ success: false, error: "Unauthorized access detected." }, { status: 401 });
//     }

//     const sanitizedEmail = userEmail.trim().toLowerCase();

//     const profileQuery = `
//       SELECT 
//         id,
//         user_id,
//         user_email,
//         username,
//         COALESCE(total_coin, 0) as total_coin,
//         COALESCE(total_dollar, 0) as total_dollar,
//         mining_speed,
//         daily_bonus,
//         hybrid_speed,
//         boost_power,
//         last_claim_daily_bonus_time,
//         last_claim_reward_time,
//         COALESCE(mining_wallet, 0) as mining_wallet,
//         created_at,
//         updated_at
//       FROM user_wallets
//       WHERE LOWER(user_email) = $1
//       LIMIT 1;
//     `;
    
//     const result = await query(profileQuery, [sanitizedEmail]);

//     if (result.rows.length === 0) {
//       return NextResponse.json({ 
//         success: false, 
//         error: "User terminal node not found in Postgres architecture." 
//       }, { status: 404 });
//     }

//     const userData = result.rows[0];

//     return NextResponse.json({
//       success: true,
//       data: {
//         id: userData.id,
//         userId: userData.user_id,
//         userEmail: userData.user_email,
//         name: userData.username && userData.username.trim() !== "" ? userData.username : userData.user_email.split('@')[0],
//         username: userData.username,
//         totalCoin: parseFloat(userData.total_coin || 0),
//         totalDollar: parseFloat(userData.total_dollar || 0),
//         miningSpeed: parseFloat(userData.mining_speed || 0),
//         dailyBonus: parseFloat(userData.daily_bonus || 0),
//         hybridSpeed: parseFloat(userData.hybrid_speed || 0),
//         boostPower: parseFloat(userData.boost_power || 0),
//         lastClaimDailyBonusTime: userData.last_claim_daily_bonus_time,
//         lastClaimRewardTime: userData.last_claim_reward_time,
//         miningWallet: parseFloat(userData.mining_wallet || 0),
//         createdAt: userData.created_at,
//         updatedAt: userData.updated_at
//       }
//     }, { status: 200 });

//   } catch (error) {
//     console.error("Postgres Profile Sync Error:", error);
//     return NextResponse.json({ 
//       success: false, 
//       error: "Internal Postgres Infrastructure Sync Error" 
//     }, { status: 500 });
//   }
// }

// // ==========================================
// // 📥 POST: সিঙ্ক, ক্লেইম, হিস্ট্রি ক্লেইম
// // ==========================================
// export async function POST(request) {
//   try {
//     const body = await request.json();
//     const { action, amount } = body;
    
//     // 🔒 ইউজার ইমেইল
//     const userEmail = "sano0099@gmail.com";
    
//     if (!userEmail) {
//       return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
//     }

//     const sanitizedEmail = userEmail.trim().toLowerCase();

//     // 🎯 অ্যাকশন অনুযায়ী কাজ করব
//     switch (action) {
      
//       // 📥 অ্যাকশন ১: মাইনিং কয়েন ক্লেইম করা (কাউন্টার থেকে)
//       case "COLLECT": {
//         if (!amount || amount <= 0) {
//           return NextResponse.json({ success: false, error: "Invalid amount" }, { status: 400 });
//         }

//         // 💰 ইউজারের বর্তমান ডাটা আনা
//         const currentData = await query(
//           `SELECT total_coin, mining_wallet FROM user_wallets WHERE LOWER(user_email) = $1`,
//           [sanitizedEmail]
//         );

//         if (currentData.rows.length === 0) {
//           return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
//         }

//         const currentTotalCoin = parseFloat(currentData.rows[0].total_coin || 0);
//         const currentMiningWallet = parseFloat(currentData.rows[0].mining_wallet || 0);

//         // 🆕 নতুন ভ্যালু ক্যালকুলেশন
//         const newTotalCoin = currentTotalCoin + amount;
//         const newMiningWallet = currentMiningWallet + amount;

//         // 💾 ডাটাবেজ আপডেট
//         await query(
//           `UPDATE user_wallets 
//            SET total_coin = $1, mining_wallet = $2, updated_at = NOW() 
//            WHERE LOWER(user_email) = $3`,
//           [newTotalCoin, newMiningWallet, sanitizedEmail]
//         );

//         return NextResponse.json({
//           success: true,
//           newTotalCoin: newTotalCoin,
//           newMiningWallet: newMiningWallet,
//           message: "Rewards collected successfully"
//         }, { status: 200 });
//       }

//       // 🔄 অ্যাকশন ২: সিঙ্ক টু ভল্ট (Mining Wallet থেকে Total Coin)
//       case "SYNC": {
//         // 💰 ইউজারের বর্তমান ডাটা আনা
//         const currentData = await query(
//           `SELECT total_coin, mining_wallet FROM user_wallets WHERE LOWER(user_email) = $1`,
//           [sanitizedEmail]
//         );

//         if (currentData.rows.length === 0) {
//           return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
//         }

//         const currentTotalCoin = parseFloat(currentData.rows[0].total_coin || 0);
//         const currentMiningWallet = parseFloat(currentData.rows[0].mining_wallet || 0);

//         // 🆕 নতুন ভ্যালু ক্যালকুলেশন
//         const newTotalCoin = currentTotalCoin + currentMiningWallet;
//         const newMiningWallet = 0; // মাইনিং ওয়ালেট রিসেট

//         // 💾 ডাটাবেজ আপডেট
//         await query(
//           `UPDATE user_wallets 
//            SET total_coin = $1, mining_wallet = $2, updated_at = NOW() 
//            WHERE LOWER(user_email) = $3`,
//           [newTotalCoin, newMiningWallet, sanitizedEmail]
//         );

//         return NextResponse.json({
//           success: true,
//           newTotalCoin: newTotalCoin,
//           newMiningWallet: newMiningWallet,
//           message: "Synced to vault successfully"
//         }, { status: 200 });
//       }

//       // 📋 অ্যাকশন ৩: হিস্ট্রি আইটেম ক্লেইম করা
//       case "CLAIM_HISTORY": {
//         if (!amount || amount <= 0) {
//           return NextResponse.json({ success: false, error: "Invalid amount" }, { status: 400 });
//         }

//         // 💰 ইউজারের বর্তমান ডাটা আনা
//         const currentData = await query(
//           `SELECT total_coin, mining_wallet FROM user_wallets WHERE LOWER(user_email) = $1`,
//           [sanitizedEmail]
//         );

//         if (currentData.rows.length === 0) {
//           return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
//         }

//         const currentTotalCoin = parseFloat(currentData.rows[0].total_coin || 0);
//         const currentMiningWallet = parseFloat(currentData.rows[0].mining_wallet || 0);

//         // 🆕 নতুন ভ্যালু ক্যালকুলেশন (Total Coin এ add হবে)
//         const newTotalCoin = currentTotalCoin + amount;
//         const newMiningWallet = currentMiningWallet + amount; // মাইনিং ওয়ালেটেও add হবে

//         // 💾 ডাটাবেজ আপডেট
//         await query(
//           `UPDATE user_wallets 
//            SET total_coin = $1, mining_wallet = $2, updated_at = NOW() 
//            WHERE LOWER(user_email) = $3`,
//           [newTotalCoin, newMiningWallet, sanitizedEmail]
//         );

//         return NextResponse.json({
//           success: true,
//           newTotalCoin: newTotalCoin,
//           newMiningWallet: newMiningWallet,
//           message: "History item claimed successfully"
//         }, { status: 200 });
//       }

//       default: {
//         return NextResponse.json({ 
//           success: false, 
//           error: "Invalid action. Supported: COLLECT, SYNC, CLAIM_HISTORY" 
//         }, { status: 400 });
//       }
//     }

//   } catch (error) {
//     console.error("Sync Wallet API Error:", error);
//     return NextResponse.json({ 
//       success: false, 
//       error: "Internal server error" 
//     }, { status: 500 });
//   }
// }