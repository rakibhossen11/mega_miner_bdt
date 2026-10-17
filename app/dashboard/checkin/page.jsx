"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, CheckCircle2, ArrowLeft, Gift, Flame, Sparkles } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

export default function DailyCheckInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [checkinData, setCheckinData] = useState({
    currentStreak: 0,
    isCheckedInToday: false,
    rewards: { 1: 100, 2: 200, 3: 300, 4: 400, 5: 500, 6: 700, 7: 1000 },
  });

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/user/checkin");
      const data = await res.json();
      if (res.ok && data.success) {
        setCheckinData(data.data);
      } else {
        toast.error(data.error || "Failed to load check-in data");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleClaim = async () => {
    if (checkinData.isCheckedInToday || claiming) return;

    setClaiming(true);
    try {
      const res = await fetch("/api/user/checkin", { method: "POST" });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message);
        fetchStatus(); // Refresh status
      } else {
        toast.error(data.error || "Claim failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error");
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060907] flex items-center justify-center text-lime-400">
        <div className="w-8 h-8 rounded-full border-2 border-lime-400 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const days = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="min-h-screen bg-[#060907] text-white px-4 py-6 pb-32 max-w-xl mx-auto select-none">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/dashboard/home")}
          className="flex items-center gap-2 bg-[#0a0f0c] border border-lime-950/60 px-3.5 py-2 rounded-xl text-xs font-semibold text-lime-400 hover:bg-lime-500/10 transition-all"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <h1 className="text-base font-bold tracking-wider uppercase text-lime-400">
          Daily Rewards
        </h1>
        <div className="w-9"></div>
      </div>

      {/* Streak Hero Card */}
      <div className="bg-[#0a0f0c] border border-lime-950/60 rounded-3xl p-6 mb-6 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-lime-500/10 rounded-full blur-2xl"></div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400">
              <Flame size={24} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Streak Bonus</h2>
              <p className="text-xs text-zinc-400">Check in every day to earn more</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-mono font-black text-lime-400">
              {checkinData.currentStreak}
            </span>
            <span className="text-xs text-zinc-500 block">/ 7 Days</span>
          </div>
        </div>

        {/* Big Claim Button */}
        <button
          onClick={handleClaim}
          disabled={checkinData.isCheckedInToday || claiming}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
            checkinData.isCheckedInToday
              ? "bg-zinc-800 text-zinc-500 border border-zinc-700/50 cursor-not-allowed"
              : "bg-lime-500 text-black hover:bg-lime-400 active:scale-98 shadow-lime-500/20"
          }`}
        >
          {claiming ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          ) : checkinData.isCheckedInToday ? (
            <>
              <CheckCircle2 size={18} />
              Claimed Today
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Claim Today's Bonus
            </>
          )}
        </button>
      </div>

      {/* 7 Days Grid */}
      <div className="grid grid-cols-3 gap-3">
        {days.map((day) => {
          const isPast = day <= checkinData.currentStreak;
          const isCurrent =
            day === checkinData.currentStreak + 1 && !checkinData.isCheckedInToday;
          const isTodayDone =
            day === checkinData.currentStreak && checkinData.isCheckedInToday;
          const rewardCoins = checkinData.rewards[day] || 100;

          return (
            <div
              key={day}
              className={`relative rounded-2xl p-4 border text-center transition-all ${
                day === 7 ? "col-span-3 flex items-center justify-between px-6 py-4" : ""
              } ${
                isTodayDone || (isPast && !isCurrent)
                  ? "bg-lime-950/20 border-lime-500/40 text-lime-400"
                  : isCurrent
                  ? "bg-[#0a0f0c] border-lime-400 ring-2 ring-lime-400/20 text-white animate-pulse"
                  : "bg-[#0a0f0c] border-lime-950/40 text-zinc-500"
              }`}
            >
              <div className={day === 7 ? "text-left" : ""}>
                <span className="text-[10px] font-bold uppercase tracking-wider block text-zinc-400">
                  Day {day}
                </span>
                <div className="text-sm font-mono font-bold text-lime-400 flex items-center justify-center gap-1 mt-1">
                  <Gift size={14} />+{rewardCoins}
                </div>
              </div>

              {day === 7 && (
                <span className="text-xs font-bold text-black bg-lime-400 px-3 py-1.5 rounded-xl">
                  BIG BONUS!
                </span>
              )}

              {(isTodayDone || (isPast && !isCurrent)) && (
                <div className="absolute top-2 right-2 text-lime-400">
                  <CheckCircle2 size={14} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}