import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getSession } from "@/app/lib/auth";

export async function GET() {
  try {
    const userSession = await getSession();
    if (!userSession || !userSession.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized! Please login first." },
        { status: 401 }
      );
    }

    const userId = userSession.id;

    // Current user info
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

    // Referred users query
    const referralsRes = await query(
      'SELECT "id", "username", "created_at" FROM "users" WHERE "referred_by" = $1 ORDER BY "created_at" DESC',
      [userId]
    );

    const referredUsersList = referralsRes.rows || [];
    const totalReferrals = referredUsersList.length;
    const totalEarnedCoins = totalReferrals * 100;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.fyermm.com";
    const referralLink = `${baseUrl}/auth/register?ref=${referralCode}`;

    return NextResponse.json(
      {
        success: true,
        data: {
          referralCode: referralCode,
          referralLink: referralLink,
          totalReferrals: totalReferrals,
          totalEarnedCoins: totalEarnedCoins,
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