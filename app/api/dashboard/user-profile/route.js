import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";

export async function GET(request) {
  try {
    const userEmail = "sano0099@gmail.com"; 

    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized access detected." }, { status: 401 });
    }

    const sanitizedEmail = userEmail.trim().toLowerCase();

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
      WHERE LOWER(user_email) = $1
      LIMIT 1;
    `;
    
    const result = await query(profileQuery, [sanitizedEmail]);

    if (result.rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "User terminal node not found in Postgres architecture." 
      }, { status: 404 });
    }

    const userData = result.rows[0];

    return NextResponse.json({
      success: true,
      data: {
        id: userData.id,
        userId: userData.user_id,
        userEmail: userData.user_email,
        name: userData.username && userData.username.trim() !== "" ? userData.username : userData.user_email.split('@')[0],
        username: userData.username,
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
    console.error("Postgres Profile Sync Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal Postgres Infrastructure Sync Error" 
    }, { status: 500 });
  }
}

// ==========================================
// 📥 POST: সিঙ্ক, ক্লেইম, হিস্ট্রি ক্লেইম
// ==========================================
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, amount } = body;
    
    // 🔒 ইউজার ইমেইল
    const userEmail = "sano0099@gmail.com";
    
    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const sanitizedEmail = userEmail.trim().toLowerCase();

    // 🎯 অ্যাকশন অনুযায়ী কাজ করব
    switch (action) {
      
      // 📥 অ্যাকশন ১: মাইনিং কয়েন ক্লেইম করা (কাউন্টার থেকে)
      case "COLLECT": {
        if (!amount || amount <= 0) {
          return NextResponse.json({ success: false, error: "Invalid amount" }, { status: 400 });
        }

        // 💰 ইউজারের বর্তমান ডাটা আনা
        const currentData = await query(
          `SELECT total_coin, mining_wallet FROM user_wallets WHERE LOWER(user_email) = $1`,
          [sanitizedEmail]
        );

        if (currentData.rows.length === 0) {
          return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        const currentTotalCoin = parseFloat(currentData.rows[0].total_coin || 0);
        const currentMiningWallet = parseFloat(currentData.rows[0].mining_wallet || 0);

        // 🆕 নতুন ভ্যালু ক্যালকুলেশন
        const newTotalCoin = currentTotalCoin + amount;
        const newMiningWallet = currentMiningWallet + amount;

        // 💾 ডাটাবেজ আপডেট
        await query(
          `UPDATE user_wallets 
           SET total_coin = $1, mining_wallet = $2, updated_at = NOW() 
           WHERE LOWER(user_email) = $3`,
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
        // 💰 ইউজারের বর্তমান ডাটা আনা
        const currentData = await query(
          `SELECT total_coin, mining_wallet FROM user_wallets WHERE LOWER(user_email) = $1`,
          [sanitizedEmail]
        );

        if (currentData.rows.length === 0) {
          return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        const currentTotalCoin = parseFloat(currentData.rows[0].total_coin || 0);
        const currentMiningWallet = parseFloat(currentData.rows[0].mining_wallet || 0);

        // 🆕 নতুন ভ্যালু ক্যালকুলেশন
        const newTotalCoin = currentTotalCoin + currentMiningWallet;
        const newMiningWallet = 0; // মাইনিং ওয়ালেট রিসেট

        // 💾 ডাটাবেজ আপডেট
        await query(
          `UPDATE user_wallets 
           SET total_coin = $1, mining_wallet = $2, updated_at = NOW() 
           WHERE LOWER(user_email) = $3`,
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

        // 💰 ইউজারের বর্তমান ডাটা আনা
        const currentData = await query(
          `SELECT total_coin, mining_wallet FROM user_wallets WHERE LOWER(user_email) = $1`,
          [sanitizedEmail]
        );

        if (currentData.rows.length === 0) {
          return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        const currentTotalCoin = parseFloat(currentData.rows[0].total_coin || 0);
        const currentMiningWallet = parseFloat(currentData.rows[0].mining_wallet || 0);

        // 🆕 নতুন ভ্যালু ক্যালকুলেশন (Total Coin এ add হবে)
        const newTotalCoin = currentTotalCoin + amount;
        const newMiningWallet = currentMiningWallet + amount; // মাইনিং ওয়ালেটেও add হবে

        // 💾 ডাটাবেজ আপডেট
        await query(
          `UPDATE user_wallets 
           SET total_coin = $1, mining_wallet = $2, updated_at = NOW() 
           WHERE LOWER(user_email) = $3`,
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
// // import { getServerSession } from "next-auth"; // আপনার সেশন থাকলে আনকমেন্ট করুন

// export async function GET(request) {
//   try {
//     // 🔒 সেশন বা কুকি থেকে লগইন করা ইউজারের ইমেইল বের করা
//     // const session = await getServerSession(authOptions);
//     // const userEmail = session?.user?.email;

//     // 🧪 ডেভেলপমেন্ট বা টেস্ট করার জন্য আপনার ডাটাবেজে থাকা রিয়েল ইমেইল:
//     const userEmail = "sano0099@gmail.com"; 

//     if (!userEmail) {
//       return NextResponse.json({ success: false, error: "Unauthorized access detected." }, { status: 401 });
//     }

//     const sanitizedEmail = userEmail.trim().toLowerCase();

//     // 🧠 টেবিলের সবগুলো ১৫টি ফিল্ডই নিখুঁতভাবে সিলেক্ট করা হলো (COALESCE সহ যাতে নাল এরর না আসে)
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

//     // ইউজার যদি ডাটাবেজে না থাকে
//     if (result.rows.length === 0) {
//       return NextResponse.json({ 
//         success: false, 
//         error: "User terminal node not found in Postgres architecture." 
//       }, { status: 404 });
//     }

//     const userData = result.rows[0];

//     // ⚡ সফল রেসপন্স পাইপলাইন (আপনার টেবিলের সব ডাটা ম্যাপ করে অবজেক্ট আকারে পাঠানো হলো)
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

// import { NextResponse } from "next/server";
// import { query } from "@/app/lib/db";
// // import { getServerSession } from "next-auth"; // আপনার সেশন বা মিডলওয়্যার থাকলে আনকমেন্ট করুন

// export async function GET(request) {
//   try {
//     // 🔒 সেশন বা কুকি থেকে লগইন করা ইউজারের ইমেইল বের করা
//     // const session = await getServerSession(authOptions);
//     // const userEmail = session?.user?.email;

//     // 🧪 ডেভেলপমেন্ট বা টেস্ট করার জন্য আপনার ডাটাবেজে থাকা রিয়েল ইমেইল:
//     const userEmail = "sano0099@gmail.com"; 

//     if (!userEmail) {
//       return NextResponse.json({ success: false, error: "Unauthorized access detected." }, { status: 401 });
//     }

//     const sanitizedEmail = userEmail.trim().toLowerCase();

//     // 🧠 আপনার সিঙ্গেল টেবিল আর্কিটেকচার অনুযায়ী সরাসরি কুয়েরি
//     // এখানে user_email দিয়ে ফিল্টার করে প্রয়োজনীয় সব কলাম তুলে আনা হচ্ছে
//     const profileQuery = `
//       SELECT 
//         id,
//         user_id,
//         user_email,
//         username,
//         COALESCE(total_coin, 0) as total_coin,
//         COALESCE(mining_wallet, 0) as mining_wallet,
//         COALESCE(mining_speed, 1.5) as mining_speed
//       FROM user_wallets
//       WHERE LOWER(user_email) = $1
//       LIMIT 1;
//     `;
    
//     const result = await query(profileQuery, [sanitizedEmail]);

//     // ইউজার যদি ডাটাবেজে না থাকে
//     if (result.rows.length === 0) {
//       return NextResponse.json({ 
//         success: false, 
//         error: "User terminal node not found in Postgres architecture." 
//       }, { status: 404 });
//     }

//     const userData = result.rows[0];

//     // ⚡ সফল রেসপন্স পাইপলাইন (আপনার রিডাক্স স্লাইসের ফুলফিলড কেসের সাথে ১০০% ম্যাচ করা)
//     return NextResponse.json({
//       success: true,
//       data: {
//         // ইউজারনেম ফাঁকা থাকলে ইমেইলের প্রথম অংশ বা একটি ডিফল্ট নাম সেট হবে
//         name: userData.username && userData.username.trim() !== "" ? userData.username : userData.user_email.split('@')[0], 
//         totalCoin: parseFloat(userData.total_coin || 0),
//         miningWallet: parseFloat(userData.mining_wallet || 0), // 🪙 রিডাক্স সেভ করার জন্য মাস্ট!
//         miningSpeed: parseFloat(userData.mining_speed || 1.5) // ডাটাবেজ থেকে লাইভ স্পিড
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


// import { NextResponse } from "next/server";
// import { query } from "@/app/lib/db";
// // import { getServerSession } from "next-auth"; // আপনার সেশন বা মিডলওয়্যার থাকলে আনকমেন্ট করুন

// export async function GET(request) {
//   try {
//     // 🔒 সেশন বা কুকি থেকে লগইন করা ইউজারের ইমেইল বের করা
//     // const session = await getServerSession(authOptions);
//     // const userEmail = session?.user?.email;

//     // 🧪 ডেভেলপমেন্ট বা টেস্ট করার জন্য আপনার ডাটাবেজে থাকা একটি রিয়েল ইমেইল এখানে দিন:
//     const userEmail = "sano0099@gmail.com"; 

//     if (!userEmail) {
//       return NextResponse.json({ success: false, error: "Unauthorized access detected." }, { status: 401 });
//     }

//     const sanitizedEmail = userEmail.trim().toLowerCase();

//     // 🧠 users এবং user_wallets টেবিল জয়েন করে ডাটা তুলে আনার কুয়েরি
//     const profileQuery = `
//       SELECT 
//         u.username, 
//         u.email, 
//         COALESCE(w.total_coin, 0) as total_coin
//       FROM users u
//       LEFT JOIN user_wallets w ON u.id = w.user_id
//       WHERE u.email = $1
//       LIMIT 1;
//     `;
    
//     const result = await query(profileQuery, [sanitizedEmail]);

//     // ইউজার যদি ডাটাবেজে না থাকে
//     if (result.rows.length === 0) {
//       return NextResponse.json({ 
//         success: false, 
//         error: "User terminal node not found in Postgres architecture." 
//       }, { status: 404 });
//     }

//     const userData = result.rows[0];

//     // সফল রেসপন্স পাইপলাইন
//     return NextResponse.json({
//       success: true,
//       data: {
//         name: userData.username, // আপনার TopNavbar-এ সুন্দরভাবে নাম দেখাবে
//         totalCoin: parseFloat(userData.total_coin || 0), // ওয়ালটের রিয়েল কয়েন ব্যালেন্স
//         miningSpeed: 1.5 // ⚡ আপাদত ডিফল্ট ১.৫ স্পিড সেট করা হলো (পরে ডাইনামিক করতে পারবেন)
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