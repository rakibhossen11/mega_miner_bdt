import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getSession } from "@/app/lib/auth";

export async function GET() {
  try {
    // ১. সেশন চেক করা (ইউজার লগইন আছে কিনা)
    const userSession = await getSession();
    if (!userSession || !userSession.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized! Please login first." },
        { status: 401 }
      );
    }

    const userId = userSession.id;

    // ২. বর্তমান ইউজারের তথ্য ও রেফারেল কোড বের করা
    const userRes = await query(
      'SELECT "id", "username", "referral_code" FROM "users" WHERE "id" = $1',
      [userId]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found." },
        { status: 404 }
      );
    }

    const currentUser = userRes.rows[0];
    const referralCode = currentUser.referral_code || currentUser.username;

    // ৩. referrals টেবিল থেকে এই ইউজারের টোটাল কয়েন আর্নিং (SUM) এবং মোট কতজন রেফার করেছে তা বের করা
    const statsQuery = `
      SELECT 
        COUNT(id) AS total_referrals,
        COALESCE(SUM(reward_amount), 0) AS total_earned_coins
      FROM "referrals"
      WHERE "referrer_id" = $1 AND "status" = 'completed';
    `;
    const statsRes = await query(statsQuery, [userId]);
    const stats = statsRes.rows[0];

    const totalReferrals = parseInt(stats.total_referrals) || 0;
    const totalEarnedCoins = parseInt(stats.total_earned_coins) || 0; // টেবিল থেকে আসল যোগফল নেওয়া হলো

    // ৪. রেফার করা ইউজারদের বিস্তারিত তালিকা ফেচ করা
    const referralsRes = await query(
      `SELECT u."id", u."username", r."created_at", r."reward_amount" 
       FROM "referrals" r
       JOIN "users" u ON r."referred_id" = u."id"
       WHERE r."referrer_id" = $1 
       ORDER BY r."created_at" DESC`,
      [userId]
    );

    const referredUsersList = referralsRes.rows || [];

    // ৫. প্রপার রেফারেল লিংক তৈরি
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.fyermm.com";
    const referralLink = `${baseUrl}/auth/register?ref=${referralCode}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          referralCode: referralCode,
          referralLink: referralLink,
          totalReferrals: totalReferrals,
          totalEarnedCoins: totalEarnedCoins, // referrals টেবিল থেকে সাম করে আসা রিয়েল কয়েন
          referredUsers: referredUsersList,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Referral API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}