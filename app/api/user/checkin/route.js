import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getSession } from "@/app/lib/auth";

const REWARD_MAP = {
  1: 100,
  2: 200,
  3: 300,
  4: 400,
  5: 500,
  6: 700,
  7: 1000,
};

// 🛠️ Local Timezone Date Generator (Fixes duplicate daily claim bug)
function getLocalDateString(dateObj = new Date()) {
  return new Date(dateObj).toLocaleDateString("en-CA", {
    timeZone: "Asia/Dhaka", // Apnar location-er timezone
  }); // Returns YYYY-MM-DD reliably
}

// GET: Check-in status
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.id;

    const checkinRes = await query(
      'SELECT * FROM "daily_checkins" WHERE "user_id" = $1',
      [userId]
    );

    const todayStr = getLocalDateString();
    let currentStreak = 0;
    let isCheckedInToday = false;

    if (checkinRes.rows.length > 0) {
      const record = checkinRes.rows[0];
      const lastDateStr = getLocalDateString(record.last_checkin_date);

      if (lastDateStr === todayStr) {
        isCheckedInToday = true;
        currentStreak = record.current_streak;
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = getLocalDateString(yesterday);

        if (lastDateStr === yesterdayStr) {
          currentStreak = record.current_streak;
        } else {
          currentStreak = 0; // Streak reset
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        currentStreak,
        isCheckedInToday,
        rewards: REWARD_MAP,
      },
    });
  } catch (error) {
    console.error("Checkin GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Daily claim execution
export async function POST() {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.id;
    const todayStr = getLocalDateString();

    // 1. Fetch user check-in history
    const checkinRes = await query(
      'SELECT * FROM "daily_checkins" WHERE "user_id" = $1',
      [userId]
    );

    let nextStreak = 1;

    if (checkinRes.rows.length > 0) {
      const record = checkinRes.rows[0];
      const lastDateStr = getLocalDateString(record.last_checkin_date);

      // 🛑 STRICT CHECK: Ek-i dine double claim Blocked
      if (lastDateStr === todayStr) {
        return NextResponse.json(
          { success: false, error: "Already claimed today! Please try again tomorrow." },
          { status: 400 }
        );
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getLocalDateString(yesterday);

      if (lastDateStr === yesterdayStr) {
        nextStreak = record.current_streak >= 7 ? 1 : record.current_streak + 1;
      } else {
        nextStreak = 1;
      }

      // Update checkin date
      await query(
        `UPDATE "daily_checkins" 
         SET "last_checkin_date" = $1, "current_streak" = $2, "updated_at" = CURRENT_TIMESTAMP 
         WHERE "user_id" = $3`,
        [todayStr, nextStreak, userId]
      );
    } else {
      // First time entry
      await query(
        `INSERT INTO "daily_checkins" ("user_id", "last_checkin_date", "current_streak") 
         VALUES ($1, $2, $3)`,
        [userId, todayStr, nextStreak]
      );
    }

    // 2. Add Reward Coins
    const rewardCoins = REWARD_MAP[nextStreak] || 100;

    const walletUpdate = `
      UPDATE "wallets" 
      SET "total_coin" = "total_coin" + $1, 
          "available_coin" = "available_coin" + $1,
          "updated_at" = CURRENT_TIMESTAMP
      WHERE "user_id" = $2;
    `;
    await query(walletUpdate, [rewardCoins, userId]);

    return NextResponse.json({
      success: true,
      message: `Day ${nextStreak} claimed! +${rewardCoins} Coins added.`,
      rewardCoins,
      nextStreak,
    });
  } catch (error) {
    console.error("Checkin POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}