import { NextResponse } from "next/server";
import { query } from "@/app/lib/db";
import { getSession } from "@/app/lib/auth";
import { LEVEL_CONFIG, calculateLevelFromXp } from "@/app/lib/level";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id;

    const userRes = await query(
      'SELECT "id", "username", "current_xp", "current_level" FROM "users" WHERE "id" = $1',
      [userId]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const user = userRes.rows[0];
    const currentXp = user.current_xp || 0;
    const currentConfig = calculateLevelFromXp(currentXp);

    // নেক্সট লেভেল ইনফো
    const nextConfig = LEVEL_CONFIG.find((c) => c.level === currentConfig.level + 1) || currentConfig;

    const xpInCurrentLevel = currentXp - currentConfig.minXp;
    const xpNeededForNextLevel = nextConfig.minXp - currentConfig.minXp || 1;
    let progressPercentage = Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100);

    if (currentConfig.level === 5) progressPercentage = 100; // Diamond Max

    return NextResponse.json({
      success: true,
      data: {
        username: user.username,
        currentXp,
        currentLevel: currentConfig.level,
        levelTitle: currentConfig.title,
        multiplier: currentConfig.multiplier,
        badgeColor: currentConfig.badgeColor,
        nextLevelXp: nextConfig.minXp,
        xpRemaining: Math.max(0, nextConfig.minXp - currentXp),
        progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
        allLevels: LEVEL_CONFIG,
      },
    });
  } catch (error) {
    console.error("Level GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}