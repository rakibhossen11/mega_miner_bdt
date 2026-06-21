import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
// import { getServerSession } from "next-auth"; // আপনার সেশন বা মিডলওয়্যার থাকলে আনকমেন্ট করুন

export async function GET(request) {
  try {
    // 🔒 সেশন বা কুকি থেকে লগইন করা ইউজারের ইমেইল বের করা
    // const session = await getServerSession(authOptions);
    // const userEmail = session?.user?.email;

    // 🧪 ডেভেলপমেন্ট বা টেস্ট করার জন্য আপনার ডাটাবেজে থাকা রিয়েল ইমেইল:
    const userEmail = "sano0099@gmail.com"; 

    if (!userEmail) {
      return NextResponse.json({ success: false, error: "Unauthorized access detected." }, { status: 401 });
    }

    const sanitizedEmail = userEmail.trim().toLowerCase();

    // 🧠 আপনার সিঙ্গেল টেবিল আর্কিটেকচার অনুযায়ী সরাসরি কুয়েরি
    // এখানে user_email দিয়ে ফিল্টার করে প্রয়োজনীয় সব কলাম তুলে আনা হচ্ছে
    const profileQuery = `
      SELECT 
        id,
        user_id,
        user_email,
        username,
        COALESCE(total_coin, 0) as total_coin,
        COALESCE(mining_wallet, 0) as mining_wallet,
        COALESCE(mining_speed, 1.5) as mining_speed
      FROM user_wallets
      WHERE LOWER(user_email) = $1
      LIMIT 1;
    `;
    
    const result = await query(profileQuery, [sanitizedEmail]);

    // ইউজার যদি ডাটাবেজে না থাকে
    if (result.rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "User terminal node not found in Postgres architecture." 
      }, { status: 404 });
    }

    const userData = result.rows[0];

    // ⚡ সফল রেসপন্স পাইপলাইন (আপনার রিডাক্স স্লাইসের ফুলফিলড কেসের সাথে ১০০% ম্যাচ করা)
    return NextResponse.json({
      success: true,
      data: {
        // ইউজারনেম ফাঁকা থাকলে ইমেইলের প্রথম অংশ বা একটি ডিফল্ট নাম সেট হবে
        name: userData.username && userData.username.trim() !== "" ? userData.username : userData.user_email.split('@')[0], 
        totalCoin: parseFloat(userData.total_coin || 0),
        miningWallet: parseFloat(userData.mining_wallet || 0), // 🪙 রিডাক্স সেভ করার জন্য মাস্ট!
        miningSpeed: parseFloat(userData.mining_speed || 1.5) // ডাটাবেজ থেকে লাইভ স্পিড
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