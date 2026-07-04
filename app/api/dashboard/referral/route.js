import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getSession } from "@/app/lib/auth"; // 🔐 আমাদের আপডেট করা সিকিউর ডাটাবেজ সেশন ইঞ্জিন

export async function GET(request) {
  try {
    // ১. সিকিউরিটি হ্যান্ডশেক: সেশন থেকে লাইভ ইউজার ডাটা বের করা
    const session = await getSession();

    if (!session || !session.id) {
      return NextResponse.json(
        { success: false, error: "Authentication token missing or session expired. Please log in again." },
        { status: 401 }
      );
    }

    const currentUserId = session.id;       // লগইন থাকা ইউজারের ৫-ডিজিটের ইউনিক user_id (integer)
    const currentLoggedUser = session.username; // লগইন থাকা ইউজারের username

    // ২. Query A: নতুন ওয়ালেট টেবিল থেকে কারেন্ট ব্যালেন্স তুলে আনা
    const walletQuery = 'SELECT "total_coin", "total_dollar" FROM "user_wallets" WHERE "user_id" = $1';
    const walletRes = await query(walletQuery, [currentUserId]);
    
    const totalCoin = parseFloat(walletRes.rows[0]?.total_coin || 0);
    const totalDollar = parseFloat(walletRes.rows[0]?.total_dollar || 0.00);

    // -- ৩. Query B: নতুন "referrals" টেবিল থেকে টোটাল রেফারেল কাউন্ট এবং আর্নিং ক্যালকুলেট করা
    const referralStatsQuery = `
      SELECT 
        COUNT(*) AS total_count,
        COALESCE(SUM("referrer_bonus_coins"), 0) AS total_earnings
      FROM "referrals" 
      WHERE "referrer_id" = $1
    `;
    const statsRes = await query(referralStatsQuery, [currentUserId]);
    const totalReferrals = parseInt(statsRes.rows[0]?.total_count || 0);
    const referralEarnings = parseInt(statsRes.rows[0]?.total_earnings || 0);

    // -- ৪. Query C: নতুন "referrals" টেবিল থেকে রিলেশনাল হিস্ট্রি রো তুলে আনা (ফ্রন্টএন্ড টেবিল সিঙ্কের জন্য)
    const historyQuery = `
      SELECT 
        "referral_id",
        "referred_id", 
        "referred_username", 
        "referrer_bonus_coins",
        "referred_bonus_coins",
        "created_at"
      FROM "referrals" 
      WHERE "referrer_id" = $1 
      ORDER BY "created_at" DESC 
      LIMIT 15
    `;
    const historyRes = await query(historyQuery, [currentUserId]);

    // ৫. ডাইনামিক ডোমেইন লিঙ্ক জেনারেটর (হোস্টিং ফ্রেন্ডলি)
    const origin = request.nextUrl.origin; // লোকালহোস্ট বা লাইভ ডোমেইন অটো ডিটেক্ট করবে
    const referralLink = `${origin}/auth/register?ref=${currentLoggedUser}`;

    // ৬. অপ্টিমাইজড JSON ডাটা স্ট্রিম ফ্রন্টএন্ডে পাঠানো
    return NextResponse.json({
      success: true,
      data: {
        totalCoin: totalCoin,
        totalDollar: totalDollar,
        totalReferrals: totalReferrals,
        referralEarnings: referralEarnings,
        referralLink: referralLink,
        referredFriends: historyRes.rows // আপনার ফ্রন্টএন্ড রেফারেল পেজের লুপের সাথে ১০০% সিঙ্কড
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