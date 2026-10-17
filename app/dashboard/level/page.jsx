"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, Zap, Trophy, Star, Lock, CheckCircle2, ChevronRight } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

export default function LevelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [levelData, setLevelData] = useState(null);

  useEffect(() => {
    async function fetchLevelData() {
      try {
        const res = await fetch("/api/user/level");
        const data = await res.json();
        console.log("Level Data Response:", data);
        if (res.ok && data.success) {
          setLevelData(data.data);
        } else {
          toast.error(data.error || "Failed to load level details");
        }
      } catch (error) {
        console.error("Error fetching level:", error);
        toast.error("Network error");
      } finally {
        setLoading(false);
      }
    }
    fetchLevelData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060907] flex items-center justify-center text-lime-400">
        <div className="w-8 h-8 rounded-full border-2 border-lime-400 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060907] text-white px-4 py-6 pb-32 select-none">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/dashboard/mining")}
          className="flex items-center gap-2 bg-[#0a0f0c] border border-lime-950/60 px-3.5 py-2 rounded-xl text-xs font-semibold text-lime-400 hover:bg-lime-500/10 transition-all"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <h1 className="text-base font-bold tracking-wider uppercase text-lime-400">
          Miner Level & Boost
        </h1>
        <div className="w-9"></div>
      </div>

      {/* Main Status Hero Card */}
      <div className="bg-[#0a0f0c] border border-lime-950/60 rounded-3xl p-6 mb-6 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-lime-500/10 rounded-full blur-3xl"></div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-black font-black text-xl shadow-lg"
              style={{ backgroundColor: levelData?.badgeColor || "#84cc16" }}
            >
              L{levelData?.currentLevel}
            </div>
            <div>
              <h2 className="text-lg font-black text-white">{levelData?.levelTitle}</h2>
              <p className="text-xs text-lime-400 font-mono font-bold flex items-center gap-1 mt-0.5">
                <Zap size={14} /> {levelData?.multiplier}x Mining Rate
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-mono font-black text-white">
              {levelData?.currentXp}
            </span>
            <span className="text-xs text-zinc-500 block font-bold">Total XP</span>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="bg-[#060907] border border-lime-950/80 rounded-2xl p-4 mt-4">
          <div className="flex justify-between items-center text-xs mb-2 font-mono">
            <span className="text-zinc-400">Level Progress</span>
            <span className="text-lime-400 font-bold">
              {levelData?.progressPercentage}%
            </span>
          </div>
          <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-lime-400 rounded-full transition-all duration-500 shadow-[0_0_12px_#84cc16]"
              style={{ width: `${levelData?.progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-zinc-500 text-center mt-2 font-mono">
            {levelData?.currentLevel === 5
              ? "Max Level Reached! Enjoy 2.0x Boost!"
              : `${levelData?.xpRemaining} XP needed for next level`}
          </p>
        </div>
      </div>

      {/* Levels Roadmap List */}
      <div className="bg-[#0a0f0c] border border-lime-950/60 rounded-3xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="text-lime-400" size={18} />
          Level Rewards Roadmap
        </h3>

        <div className="space-y-3">
          {levelData?.allLevels?.map((lvl) => {
            const isUnlocked = levelData?.currentLevel >= lvl.level;
            const isCurrent = levelData?.currentLevel === lvl.level;

            return (
              <div
                key={lvl.level}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  isCurrent
                    ? "bg-lime-950/30 border-lime-400 ring-1 ring-lime-400/40"
                    : isUnlocked
                    ? "bg-[#060907] border-lime-950/60 text-zinc-300"
                    : "bg-[#060907]/50 border-zinc-900 opacity-60 text-zinc-600"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-xs text-black shrink-0"
                    style={{ backgroundColor: lvl.badgeColor }}
                  >
                    L{lvl.level}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {lvl.title}
                      {isCurrent && (
                        <span className="text-[9px] bg-lime-500 text-black px-1.5 py-0.5 rounded font-black uppercase">
                          Current
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                      Req: {lvl.minXp} XP • Boost: <span className="text-lime-400">{lvl.multiplier}x</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {lvl.bonusCoins > 0 && (
                    <span className="text-xs font-mono font-bold text-lime-400 block">
                      +{lvl.bonusCoins} Coins
                    </span>
                  )}
                  {isUnlocked ? (
                    <CheckCircle2 size={16} className="text-lime-400 ml-auto mt-1" />
                  ) : (
                    <Lock size={16} className="text-zinc-600 ml-auto mt-1" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}