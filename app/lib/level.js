import { query } from "@/app/lib/db";

// লেভেল কনফিগারেশন চার্ট
export const LEVEL_CONFIG = [
  { level: 1, title: "Novice Miner", minXp: 0, maxXp: 500, multiplier: 1.0, bonusCoins: 0, badgeColor: "#a1a1aa" },
  { level: 2, title: "Bronze Miner", minXp: 501, maxXp: 1500, multiplier: 1.1, bonusCoins: 100, badgeColor: "#cd7f32" },
  { level: 3, title: "Silver Miner", minXp: 1501, maxXp: 3500, multiplier: 1.25, bonusCoins: 250, badgeColor: "#c0c0c0" },
  { level: 4, title: "Gold Miner", minXp: 3501, maxXp: 7000, multiplier: 1.5, bonusCoins: 500, badgeColor: "#ffd700" },
  { level: 5, title: "Diamond Miner", minXp: 7001, maxXp: 999999, multiplier: 2.0, bonusCoins: 1000, badgeColor: "#00ffff" },
];

// XP অনুযায়ী বর্তমান লেভেল বের করার ফাংশন
export function calculateLevelFromXp(xp) {
  const userXp = xp || 0;
  let currentConfig = LEVEL_CONFIG[0];

  for (const config of LEVEL_CONFIG) {
    if (userXp >= config.minXp) {
      currentConfig = config;
    }
  }
  return currentConfig;
}

// ইউজারকে XP দেওয়া এবং লেভেল আপ হলে বোনাস কয়েন দেওয়া
export async function addXpToUser(userId, xpToAdd) {
  try {
    // ১. ইউজারের বর্তমান XP ও Level নিয়ে আসা
    const userRes = await query(
      'SELECT "current_xp", "current_level" FROM "users" WHERE "id" = $1',
      [userId]
    );

    if (userRes.rows.length === 0) return null;

    const oldXp = userRes.rows[0].current_xp || 0;
    const oldLevel = userRes.rows[0].current_level || 1;
    const newXp = oldXp + xpToAdd;

    const newLevelConfig = calculateLevelFromXp(newXp);
    const newLevel = newLevelConfig.level;

    // ২. XP ও Level আপডেট করা
    await query(
      'UPDATE "users" SET "current_xp" = $1, "current_level" = $2, "updated_at" = CURRENT_TIMESTAMP WHERE "id" = $3',
      [newXp, newLevel, userId]
    );

    let leveledUp = false;
    let bonusGiven = 0;

    // ৩. যদি লেভেল আপ হয়, তবে সাথে সাথে বোনাস কয়েন ওয়ালেটে জমা হওয়া
    if (newLevel > oldLevel) {
      leveledUp = true;
      bonusGiven = newLevelConfig.bonusCoins;

      if (bonusGiven > 0) {
        await query(
          `UPDATE "wallets" 
           SET "total_coin" = "total_coin" + $1, 
               "available_coin" = "available_coin" + $1,
               "updated_at" = CURRENT_TIMESTAMP 
           WHERE "user_id" = $2`,
          [bonusGiven, userId]
        );
      }
    }

    return {
      newXp,
      newLevel,
      leveledUp,
      bonusGiven,
      levelTitle: newLevelConfig.title,
    };
  } catch (error) {
    console.error("Error adding XP to user:", error);
    return null;
  }
}