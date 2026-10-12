"use client";
import React, { useEffect, useState } from "react";
import { Coins, Crown } from "lucide-react";

export default function BalanceCard() {
  const [wallet, setWallet] = useState(null);
  console.log(wallet);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchWallet() {
      try {
        const res = await fetch("/api/user/wallets", {
          method: "GET",
          credentials: "include", // কুকি পাঠানোর জন্য জরুরি
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setWallet(data.data);
        } else {
          setError(data.error || "Failed to load wallet");
          if (res.status === 401) {
            // ইউজার লগইন করা না থাকলে রিডাইরেক্ট করে লগইন পেজে পাঠাতে পারেন
            window.location.href = "/login";
          }
        }
      } catch (err) {
        console.error("Error fetching wallet:", err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchWallet();
  }, []);

  if (loading) {
    return <div className="text-zinc-400 text-xs">Loading balance...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-xs">{error}</div>;
  }

  return (
    <div className="bg-[#111827] rounded-[24px] p-5 mt-[10px] border border-[#1e293b]">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <Coins color="#f59e0b" size={18} fill="#f59e0b" />
          <span className="text-[#94a3b8] text-[13px] font-semibold ml-[6px]">
            Total Balance
          </span>
        </div>
        <div className="flex items-center bg-[#f59e0b20] px-[10px] py-[4px] rounded-[12px] border border-[#f59e0b]">
          <Crown color="#f59e0b" size={14} fill="#f59e0b" />
          <span className="text-[#f59e0b] text-[11px] font-bold ml-[4px]">
            PRO
          </span>
        </div>
      </div>

      <h1 className="text-white text-[32px] font-bold">
        {wallet?.totalCoin ?? 0} <span className="text-[#f59e0b] text-[18px]">Coins</span>
      </h1>
      <p className="text-[#10b981] text-[14px] font-semibold mt-1">
        ≈ ${wallet?.availableCash ?? "0.00"} USD
      </p>
    </div>
    // <div className="bg-[#060c14] border border-[#2EFF2E]/25 rounded-2xl p-5 shadow-lg">
    //   <div className="flex items-center gap-2 mb-2">
    //     <Coins className="w-5 h-5 text-[#2EFF2E]" />
    //     <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Total Balance</span>
    //   </div>
    //   <h1 className="text-3xl font-mono font-black text-zinc-100">
    //     {wallet?.totalCoin ?? 0} <span className="text-[#2EFF2E] text-lg font-sans">Coins</span>
    //   </h1>
    //   <p className="text-xs text-[#2EFF2E] font-semibold mt-1">
    //     ≈ ${wallet?.availableCash ?? "0.00"} USD
    //   </p>
    // </div>
  );
}
