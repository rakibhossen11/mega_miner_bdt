import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getSession } from "@/app/lib/auth";
import { calculateLevelFromXp, addXpToUser } from "@/app/lib/level";

const MINING_DURATION_HOURS = 24;
const BASE_REWARD_COINS = 240; // 24 ghontay base coin
const START_XP = 30;
const CLAIM_XP = 50;

// GET: Mining Status Check
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id;

    // User er XP & Level fetch kora multiplier ber korar jonno
    const userRes = await query(
      'SELECT "current_xp", "current_level" FROM "users" WHERE "id" = $1',
      [userId]
    );
    const userXp = userRes.rows[0]?.current_xp || 0;
    const levelConfig = calculateLevelFromXp(userXp);
    const multiplier = levelConfig.multiplier;

    // Mining session fetch kora
    const miningRes = await query(
      'SELECT * FROM "mining_sessions" WHERE "user_id" = $1',
      [userId]
    );

    let sessionData = null;
    const now = new Date();

    if (miningRes.rows.length > 0) {
      const rec = miningRes.rows[0];
      const endTime = new Date(rec.end_time);
      const timeLeft = endTime.getTime() - now.getTime();

      sessionData = {
        isActive: timeLeft > 0,
        isCompleted: timeLeft <= 0,
        startTime: rec.start_time,
        endTime: rec.end_time,
        timeRemaining: Math.max(0, timeLeft),
        potentialCoins: Math.floor(BASE_REWARD_COINS * multiplier),
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        multiplier,
        session: sessionData,
      },
    });
  } catch (error) {
    console.error("Mining GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Start Mining or Claim Rewards
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id;
    const body = await request.json();
    const action = body.action; // 'start' ba 'claim'

    // User level & multiplier
    const userRes = await query(
      'SELECT "current_xp" FROM "users" WHERE "id" = $1',
      [userId]
    );
    const userXp = userRes.rows[0]?.current_xp || 0;
    const levelConfig = calculateLevelFromXp(userXp);
    const multiplier = levelConfig.multiplier;

    const miningRes = await query(
      'SELECT * FROM "mining_sessions" WHERE "user_id" = $1',
      [userId]
    );

    const now = new Date();

    if (action === "start") {
      if (miningRes.rows.length > 0) {
        const rec = miningRes.rows[0];
        const endTime = new Date(rec.end_time);
        if (endTime > now) {
          return NextResponse.json({ success: false, error: "Mining session is already active!" }, { status: 400 });
        }
      }

      const newEndTime = new Date(now.getTime() + MINING_DURATION_HOURS * 60 * 60 * 1000);

      if (miningRes.rows.length > 0) {
        await query(
          'UPDATE "mining_sessions" SET "start_time" = $1, "end_time" = $2, "status" = \'active\', "updated_at" = CURRENT_TIMESTAMP WHERE "user_id" = $3',
          [now, newEndTime, userId]
        );
      } else {
        await query(
          'INSERT INTO "mining_sessions" ("user_id", "start_time", "end_time", "status") VALUES ($1, $2, $3, \'active\')',
          [userId, now, newEndTime]
        );
      }

      // Start korar sathe sathe +30 XP reward
      await addXpToUser(userId, START_XP);

      return NextResponse.json({
        success: true,
        message: "Mining session started successfully! +30 XP added.",
      });
    } else if (action === "claim") {
      if (miningRes.rows.length === 0) {
        return NextResponse.json({ success: false, error: "No active mining session found." }, { status: 400 });
      }

      const rec = miningRes.rows[0];
      const endTime = new Date(rec.end_time);

      if (endTime > now) {
        return NextResponse.json({ success: false, error: "Mining session is not finished yet!" }, { status: 400 });
      }

      const earnedCoins = Math.floor(BASE_REWARD_COINS * multiplier);

      // Wallet-e coins add kora
      await query(
        'UPDATE "wallets" SET "total_coin" = "total_coin" + $1, "available_coin" = "available_coin" + $1, "updated_at" = CURRENT_TIMESTAMP WHERE "user_id" = $2',
        [earnedCoins, userId]
      );

      // Session delete ba reset kore dewa jate abar start kora jay
      await query('DELETE FROM "mining_sessions" WHERE "user_id" = $1', [userId]);

      // Claim korar por +50 XP reward ebong level check
      const xpResult = await addXpToUser(userId, CLAIM_XP);

      return NextResponse.json({
        success: true,
        message: `Successfully claimed ${earnedCoins} Coins & +${CLAIM_XP} XP!`,
        earnedCoins,
        xpData: xpResult,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("Mining POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}