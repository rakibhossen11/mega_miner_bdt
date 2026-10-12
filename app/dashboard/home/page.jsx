"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  CalendarCheck, 
  Tv, 
  HelpCircle, 
  Users, 
  Ticket, 
  Crown, 
  Tag, 
  Bell, 
  Coins, 
  ArrowRight, 
  Sparkles 
} from "lucide-react";
import BalanceCard from "@/app/components/BalanceCard";
import VipMemberCard from "@/app/components/VipMemberCard";

export default function HomeScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setUserData({
        full_name: "Miner User",
        total_coin: "1,250",
        available_cash: "12.50"
      });
      setLoading(false);
    }, 400);
  }, []);

  const userFullName = userData?.full_name || "Miner User";
  const avatarLetter = userFullName ? userFullName.charAt(0).toUpperCase() : "U";

  const coinsBalance = userData?.total_coin || "0";
  const cashBalance = userData?.available_cash || "0.00";

  // React Native কোডের আসল কালার এবং ফিচার লিস্ট হুবহু রাখা হলো
  const features = [
    // { id: "1", name: "Daily Check In", desc: "Daily Rewards", icon: CalendarCheck, color: "#3b82f6", target: "/dashboard/daily-checkin" },
    // { id: "2", name: "Spin Wheel", desc: "Lucky Spin", icon: Sparkles, color: "#ec4899", target: "/dashboard/spin" },
    // { id: "3", name: "Reward Ads", desc: "Watch & Earn", icon: Tv, color: "#10b981", target: "/dashboard/ads" },
    // { id: "4", name: "Scratch Card", desc: "Test Your Luck", icon: Ticket, color: "#f59e0b", target: "/dashboard/scratch" },
    // { id: "5", name: "Quiz", desc: "Play & Win", icon: HelpCircle, color: "#8b5cf6", target: "/dashboard/quiz" },
    // { id: "6", name: "Lucky Draw", desc: "Mega Giveaways", icon: Ticket, color: "#ef4444", target: "/dashboard/draw" },
    // { id: "7", name: "Referral", desc: "Invite Friends", icon: Users, color: "#06b6d4", target: "/dashboard/referral" },
    // { id: "8", name: "Coupons", desc: "Free Vouchers", icon: Tag, color: "#64748b", target: "/dashboard/coupons" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#f59e0b] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-white pb-32 select-none max-w-xl mx-auto">
      
      {/* 🔹 1. Top Profile & Notification Header */}
      {/* <div className="flex justify-between items-center px-5 py-[15px]">
        <div className="flex items-center">
          <div className="w-[42px] h-[42px] rounded-[21px] bg-[#1e293b] justify-center items-center mr-3 border border-[#334155] flex">
            <span className="text-[#f59e0b] text-[18px] font-bold">{avatarLetter}</span>
          </div>
          <div>
            <p className="text-[#64748b] text-[12px]">Welcome back,</p>
            <h2 className="text-white text-[15px] font-bold">{userFullName}</h2>
          </div>
        </div>
        
        <button 
          onClick={() => router.push("/dashboard/notifications")}
          className="bg-[#111827] p-[10px] rounded-[12px] border border-[#1e293b] relative cursor-pointer"
        >
          <Bell color="#fff" size={22} />
          <span className="absolute top-[10px] right-[11px] w-2 h-2 rounded-full bg-[#ef4444]"></span>
        </button>
      </div> */}

      <div className="px-5">
        <BalanceCard />
        
        {/* 🔹 2. Premium Wallet/Balance Card */}
        {/* <div className="bg-[#111827] rounded-[24px] p-5 mt-[10px] border border-[#1e293b]">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <Coins color="#f59e0b" size={18} fill="#f59e0b" />
              <span className="text-[#94a3b8] text-[13px] font-semibold ml-[6px]">Total Balance</span>
            </div>
            <div className="flex items-center bg-[#f59e0b20] px-[10px] py-[4px] rounded-[12px] border border-[#f59e0b]">
              <Crown color="#f59e0b" size={14} fill="#f59e0b" />
              <span className="text-[#f59e0b] text-[11px] font-bold ml-[4px]">PRO</span>
            </div>
          </div>

          <h1 className="text-white text-[32px] font-bold">
            {coinsBalance} <span className="text-[#f59e0b] text-[18px]">Coins</span>
          </h1>
          <p className="text-[#10b981] text-[14px] font-semibold mt-1">
            ≈ ${cashBalance} USD
          </p>
        </div> */}

        {/* 🔹 3. Membership / Banner Promos */}
        <VipMemberCard />
        {/* <div 
          onClick={() => router.push("/dashboard/upgrade")}
          className="bg-[#4f46e5] rounded-[20px] p-4 my-5 flex items-center justify-between cursor-pointer"
        >
          <div className="flex-1 mr-[10px]">
            <h3 className="text-white text-[16px] font-bold">Upgrade VIP Membership</h3>
            <p className="text-[#c7d2fe] text-[12px] mt-1">Get 2x faster mining rate & ad-free experience.</p>
          </div>
          <ArrowRight color="#fff" size={20} />
        </div> */}

        {/* 🔹 4. Main Features Grid */}
        <h3 className="text-white text-[18px] font-bold mb-[15px]">Earn Rewards</h3>
        
        <div className="grid grid-cols-2 gap-3.5">
          {features.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => router.push(item.target)}
                className="bg-[#111827] rounded-[20px] p-4 border border-[#1e293b] flex flex-col items-start cursor-pointer hover:border-slate-700 transition-all"
              >
                {/* আইকনের নিজস্ব কালার ব্যাকগ্রাউন্ডসহ (যেমন React Native কোডে ছিল) */}
                <div 
                  className="p-[10px] rounded-[14px] mb-3 flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <IconComponent color={item.color} size={24} />
                </div>
                <h4 className="text-white text-[14px] font-bold truncate w-full">{item.name}</h4>
                <p className="text-[#64748b] text-[11px] mt-0.5 truncate w-full">{item.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}