"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Copy, Check, ArrowLeft, Award, Sparkles, Share2 } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

export default function ReferralPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [referralData, setReferralData] = useState(null);
  const [copied, setCopied] = useState(false);

  // এপিআই থেকে রেফারেল ডাটা ফেচ করা
  useEffect(() => {
    async function fetchReferrals() {
      try {
        const res = await fetch("/api/user/referrals");
        const data = await res.json();
        if (res.ok && data.success) {
          setReferralData(data.data);
        } else {
          toast.error(data.error || "Failed to load referral data");
        }
      } catch (error) {
        console.error("Error fetching referrals:", error);
        toast.error("Something went wrong!");
      } finally {
        setLoading(false);
      }
    }
    fetchReferrals();
  }, []);

  // লিংক কপি করার ফাংশন
  const handleCopyLink = () => {
    if (referralData?.referralLink) {
      navigator.clipboard.writeText(referralData.referralLink);
      setCopied(true);
      toast.success("Referral link copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060907] flex items-center justify-center text-lime-400">
        <div className="w-8 h-8 rounded-full border-2 border-lime-400 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060907] text-white px-4 py-6 pb-32 max-w-xl mx-auto select-none">
      <Toaster position="top-center" />

      {/* 🔙 ব্যাক বাটন ও হেডার */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/dashboard/mining")}
          className="flex items-center gap-2 bg-[#0a0f0c] border border-lime-950/60 px-3.5 py-2 rounded-xl text-xs font-semibold text-lime-400 hover:bg-lime-500/10 transition-all"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <h1 className="text-base font-bold tracking-wider uppercase text-lime-400">My Referral Team</h1>
        <div className="w-9"></div> {/* Alignment spacer */}
      </div>

      {/* 🏆 স্ট্যাটিস্টিকস কার্ড (Total Referrals & Earned Coins) */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#0a0f0c] border border-lime-950/60 rounded-2xl p-4 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-lime-500/5 rounded-full blur-xl"></div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="text-lime-400" size={18} />
            <span className="text-[11px] text-zinc-400 font-bold uppercase">Total Team</span>
          </div>
          <h2 className="text-2xl font-mono font-black text-white">
            {referralData?.totalReferrals || 0} <span className="text-xs font-sans text-zinc-400">Users</span>
          </h2>
        </div>

        <div className="bg-[#0a0f0c] border border-lime-950/60 rounded-2xl p-4 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-lime-500/5 rounded-full blur-xl"></div>
          <div className="flex items-center gap-2 mb-2">
            <Award className="text-lime-400" size={18} />
            <span className="text-[11px] text-zinc-400 font-bold uppercase">Bonus Earned</span>
          </div>
          <h2 className="text-2xl font-mono font-black text-lime-400">
            {referralData?.totalEarnedCoins || 0} <span className="text-xs font-sans text-zinc-400">Coins</span>
          </h2>
        </div>
      </div>

      {/* 🔗 ইনভাইট লিংক ও কোড শেয়ার সেকশন */}
      <div className="bg-[#0a0f0c] border border-lime-950/60 rounded-2xl p-5 mb-6 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="text-lime-400" size={18} />
          <h3 className="text-sm font-bold text-white">Invite Friends & Earn</h3>
        </div>
        <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
          Share your unique referral link with friends. When they join your team, you instantly earn bonus mining coins!
        </p>

        {/* লিংক বক্স */}
        <div className="bg-[#060907] border border-lime-950/80 rounded-xl p-3 flex items-center justify-between gap-2 mb-3">
          <span className="text-xs text-zinc-300 font-mono truncate">
            {referralData?.referralLink || "Loading link..."}
          </span>
          <button
            onClick={handleCopyLink}
            className="bg-lime-500 hover:bg-lime-400 text-black px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="text-[11px] text-zinc-500 text-center font-mono">
          Your Referral Code: <span className="text-lime-400 font-bold">{referralData?.referralCode}</span>
        </div>
      </div>

      {/* 📋 রেফার করা ইউজারদের তালিকা (Referred Users List) */}
      <div className="bg-[#0a0f0c] border border-lime-950/60 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Share2 className="text-lime-400" size={16} />
          Your Referred Members ({referralData?.referredUsers?.length || 0})
        </h3>

        {referralData?.referredUsers?.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto text-zinc-600 mb-2" size={32} />
            <p className="text-xs text-zinc-400">No referrals yet. Share your link to start building your team!</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {referralData?.referredUsers?.map((user, index) => (
              <div 
                key={user.id || index}
                className="bg-[#060907] border border-lime-950/40 rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-400 font-bold text-xs">
                    {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{user.username}</h4>
                    <p className="text-[10px] text-zinc-500">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-lime-500/10 text-lime-400 px-2 py-1 rounded-md border border-lime-500/20">
                  +100 Coins
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}